const acorn = require('acorn');
const walk = require('acorn-walk');

class CodeParser {
  parseJavaScript(content, filePath) {
    const functions = [];
    const imports = [];
    const exports = [];

    try {
      const ast = acorn.parse(content, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true,
        allowHashBang: true,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true
      });

      // Extract imports
      walk.simple(ast, {
        ImportDeclaration(node) {
          imports.push({
            source: node.source.value,
            specifiers: node.specifiers.map(s => ({
              type: s.type,
              name: s.local ? s.local.name : s.imported?.name || 'default'
            }))
          });
        },
        CallExpression(node) {
          if (node.callee.name === 'require' && node.arguments[0]?.value) {
            imports.push({
              source: node.arguments[0].value,
              specifiers: [{ type: 'require', name: 'default' }]
            });
          }
        }
      });

      // Extract exports
      walk.simple(ast, {
        ExportNamedDeclaration(node) {
          if (node.declaration) {
            if (node.declaration.id) {
              exports.push(node.declaration.id.name);
            } else if (node.declaration.declarations) {
              node.declaration.declarations.forEach(d => {
                if (d.id.name) exports.push(d.id.name);
              });
            }
          }
          if (node.specifiers) {
            node.specifiers.forEach(s => {
              exports.push(s.exported.name);
            });
          }
        },
        ExportDefaultDeclaration(node) {
          exports.push('default');
        },
        AssignmentExpression(node) {
          if (node.left.type === 'MemberExpression') {
            if (node.left.object.name === 'module' && node.left.property.name === 'exports') {
              exports.push('default');
            } else if (node.left.object.name === 'exports') {
              exports.push(node.left.property.name);
            }
          }
        }
      });

      // Extract functions
      walk.simple(ast, {
        FunctionDeclaration(node) {
          const func = extractFunctionInfo(node, content, 'function');
          if (func) functions.push(func);
        },
        FunctionExpression(node) {
          const func = extractFunctionInfo(node, content, 'function');
          if (func) functions.push(func);
        },
        ArrowFunctionExpression(node) {
          // Only capture named arrow functions (assigned to variables)
          // This is handled in VariableDeclaration
        },
        MethodDefinition(node) {
          const func = extractMethodInfo(node, content);
          if (func) functions.push(func);
        },
        ClassDeclaration(node) {
          functions.push({
            name: node.id?.name || 'AnonymousClass',
            type: 'class',
            startLine: node.loc.start.line,
            endLine: node.loc.end.line,
            parameters: [],
            isExported: false,
            isAsync: false,
            calls: [],
            code: content.substring(node.start, Math.min(node.end, node.start + 500))
          });
        },
        VariableDeclaration(node) {
          node.declarations.forEach(decl => {
            if (decl.init && 
                (decl.init.type === 'ArrowFunctionExpression' || 
                 decl.init.type === 'FunctionExpression')) {
              functions.push({
                name: decl.id.name,
                type: decl.init.async ? 'async' : 'arrow',
                startLine: node.loc.start.line,
                endLine: node.loc.end.line,
                parameters: decl.init.params.map(p => ({
                  name: p.name || p.left?.name || 'param',
                  type: 'any'
                })),
                isExported: false,
                isAsync: decl.init.async || false,
                calls: extractCalls(decl.init, content),
                code: content.substring(node.start, Math.min(node.end, node.start + 500))
              });
            }
          });
        }
      });

      return { functions, imports: imports.map(i => i.source), exports };
    } catch (error) {
      // Parsing failed - return empty results
      console.log(`Could not parse ${filePath}: ${error.message}`);
      return { functions: [], imports: [], exports: [] };
    }
  }

  parsePython(content, filePath) {
    const functions = [];
    const imports = [];
    const exports = [];

    try {
      const lines = content.split('\n');
      let currentFunction = null;
      let indentLevel = 0;
      let inClass = false;
      let className = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Parse imports
        if (trimmedLine.startsWith('import ')) {
          const match = trimmedLine.match(/import\s+(\S+)/);
          if (match) imports.push(match[1].split('.')[0]);
        } else if (trimmedLine.startsWith('from ')) {
          const match = trimmedLine.match(/from\s+(\S+)\s+import/);
          if (match) imports.push(match[1].split('.')[0]);
        }

        // Parse class definitions
        if (trimmedLine.startsWith('class ')) {
          const match = trimmedLine.match(/class\s+(\w+)/);
          if (match) {
            inClass = true;
            className = match[1];
            functions.push({
              name: className,
              type: 'class',
              startLine: i + 1,
              endLine: i + 1,
              parameters: [],
              isExported: true,
              isAsync: false,
              calls: [],
              code: line
            });
          }
        }

        // Parse function definitions
        if (trimmedLine.startsWith('def ') || trimmedLine.startsWith('async def ')) {
          const isAsync = trimmedLine.startsWith('async');
          const match = trimmedLine.match(/def\s+(\w+)\s*\(([^)]*)\)/);
          
          if (match) {
            const funcName = match[1];
            const params = match[2].split(',').map(p => ({
              name: p.trim().split(':')[0].split('=')[0].trim(),
              type: 'any'
            })).filter(p => p.name && p.name !== 'self');

            currentFunction = {
              name: inClass ? `${className}.${funcName}` : funcName,
              type: isAsync ? 'async' : (inClass ? 'method' : 'function'),
              startLine: i + 1,
              endLine: i + 1,
              parameters: params,
              isExported: !funcName.startsWith('_'),
              isAsync: isAsync,
              calls: [],
              code: ''
            };
            functions.push(currentFunction);
          }
        }

        // Track function end by indentation
        if (currentFunction) {
          const currentIndent = line.length - line.trimStart().length;
          if (trimmedLine && currentIndent === 0 && !trimmedLine.startsWith('def ') && !trimmedLine.startsWith('class ') && !trimmedLine.startsWith('@')) {
            currentFunction.endLine = i;
            currentFunction.code = lines.slice(currentFunction.startLine - 1, currentFunction.endLine).join('\n').substring(0, 500);
            currentFunction = null;
            inClass = false;
          }
        }
      }

      // Close any open function
      if (currentFunction) {
        currentFunction.endLine = lines.length;
        currentFunction.code = lines.slice(currentFunction.startLine - 1, currentFunction.endLine).join('\n').substring(0, 500);
      }

      return { functions, imports, exports };
    } catch (error) {
      console.log(`Could not parse Python ${filePath}: ${error.message}`);
      return { functions: [], imports: [], exports: [] };
    }
  }

  parseTypeScript(content, filePath) {
    // TypeScript parsing uses the same approach as JavaScript
    // since acorn can handle most TS syntax when we skip types
    return this.parseJavaScript(content, filePath);
  }

  parseFile(content, filePath, language) {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return this.parseJavaScript(content, filePath);
      case 'python':
        return this.parsePython(content, filePath);
      default:
        return this.parseGeneric(content, filePath);
    }
  }

  parseGeneric(content, filePath) {
    // Basic pattern matching for other languages
    const functions = [];
    const imports = [];
    const lines = content.split('\n');

    // Common function patterns
    const funcPatterns = [
      /function\s+(\w+)\s*\(/,
      /def\s+(\w+)\s*\(/,
      /fn\s+(\w+)\s*\(/,
      /func\s+(\w+)\s*\(/,
      /public\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/,
      /private\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/,
    ];

    // Common import patterns
    const importPatterns = [
      /import\s+["']([^"']+)["']/,
      /from\s+["']([^"']+)["']/,
      /require\s*\(\s*["']([^"']+)["']\s*\)/,
      /#include\s*[<"]([^>"]+)[>"]/,
      /using\s+(\w+(?:\.\w+)*);/,
    ];

    lines.forEach((line, i) => {
      // Extract functions
      for (const pattern of funcPatterns) {
        const match = line.match(pattern);
        if (match) {
          functions.push({
            name: match[1],
            type: 'function',
            startLine: i + 1,
            endLine: i + 1,
            parameters: [],
            isExported: false,
            isAsync: false,
            calls: [],
            code: line.substring(0, 200)
          });
          break;
        }
      }

      // Extract imports
      for (const pattern of importPatterns) {
        const match = line.match(pattern);
        if (match) {
          imports.push(match[1]);
          break;
        }
      }
    });

    return { functions, imports, exports: [] };
  }
}

// Helper functions
function extractFunctionInfo(node, content, type) {
  if (!node.id?.name && type === 'function') return null;
  
  return {
    name: node.id?.name || 'anonymous',
    type: node.async ? 'async' : type,
    startLine: node.loc.start.line,
    endLine: node.loc.end.line,
    parameters: node.params.map(p => ({
      name: p.name || p.left?.name || 'param',
      type: 'any'
    })),
    isExported: false,
    isAsync: node.async || false,
    calls: extractCalls(node, content),
    code: content.substring(node.start, Math.min(node.end, node.start + 500))
  };
}

function extractMethodInfo(node, content) {
  return {
    name: node.key.name || node.key.value || 'method',
    type: node.kind === 'constructor' ? 'constructor' : 'method',
    startLine: node.loc.start.line,
    endLine: node.loc.end.line,
    parameters: node.value.params ? node.value.params.map(p => ({
      name: p.name || p.left?.name || 'param',
      type: 'any'
    })) : [],
    isExported: false,
    isAsync: node.value.async || false,
    calls: extractCalls(node.value, content),
    code: content.substring(node.start, Math.min(node.end, node.start + 500))
  };
}

function extractCalls(node, content) {
  const calls = [];
  try {
    walk.simple(node, {
      CallExpression(callNode) {
        if (callNode.callee.name) {
          calls.push(callNode.callee.name);
        } else if (callNode.callee.property?.name) {
          calls.push(callNode.callee.property.name);
        }
      }
    });
  } catch (e) {
    // Ignore walk errors
  }
  return [...new Set(calls)];
}

module.exports = new CodeParser();
