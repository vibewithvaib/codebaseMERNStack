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
