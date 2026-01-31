const { Repository, Commit, File, Function, Dependency, Embedding } = require('../models');
const gitService = require('./gitService');
const codeParser = require('./codeParser');
const embeddingService = require('./embeddingService');
const path = require('path');

class AnalysisService {
  async analyzeRepository(repositoryId) {
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    try {
      // Update status to analyzing
      await this.updateStatus(repositoryId, 'analyzing', 'Starting analysis...', 0);

      const repoPath = repository.localPath;

      // Step 1: Parse git history (20%)
      await this.updateStatus(repositoryId, 'analyzing', 'Parsing git history...', 5);
      const commits = await gitService.getCommitHistory(repoPath);
      await this.saveCommits(repositoryId, commits);
      await this.updateStatus(repositoryId, 'analyzing', `Parsed ${commits.length} commits`, 20);

      // Step 2: Extract files (40%)
      await this.updateStatus(repositoryId, 'analyzing', 'Extracting files...', 25);
      const files = await gitService.getRepositoryFiles(repoPath);
      const savedFiles = await this.saveFiles(repositoryId, files);
      await this.updateStatus(repositoryId, 'analyzing', `Extracted ${files.length} files`, 40);

      // Step 3: Parse code and extract functions (60%)
      await this.updateStatus(repositoryId, 'analyzing', 'Parsing code and extracting functions...', 45);
      const allFunctions = await this.extractFunctions(repositoryId, savedFiles);
      await this.updateStatus(repositoryId, 'analyzing', `Extracted ${allFunctions.length} functions`, 60);

      // Step 4: Build dependency graph (75%)
      await this.updateStatus(repositoryId, 'analyzing', 'Building dependency graph...', 65);
      await this.buildDependencyGraph(repositoryId, savedFiles, allFunctions);
      await this.updateStatus(repositoryId, 'analyzing', 'Dependency graph built', 75);

      // Step 5: Generate embeddings (95%)
      await this.updateStatus(repositoryId, 'analyzing', 'Generating embeddings...', 80);
      await this.generateEmbeddings(repositoryId, savedFiles, allFunctions, commits);
      await this.updateStatus(repositoryId, 'analyzing', 'Embeddings generated', 95);

      // Step 6: Update stats and mark as ready
      const stats = await this.calculateStats(repositoryId);
      await Repository.findByIdAndUpdate(repositoryId, {
        status: 'ready',
        statusMessage: 'Analysis complete',
        analysisProgress: 100,
        stats,
        lastAnalyzedAt: new Date()
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Analysis error:', error);
      await this.updateStatus(repositoryId, 'error', error.message, 0);
      throw error;
    }
  }

  async updateStatus(repositoryId, status, message, progress) {
    await Repository.findByIdAndUpdate(repositoryId, {
      status,
      statusMessage: message,
      analysisProgress: progress
    });
  }

  async saveCommits(repositoryId, commits) {
    const savedCommits = [];
    
    for (const commit of commits) {
      try {
        const savedCommit = await Commit.findOneAndUpdate(
          { repository: repositoryId, hash: commit.hash },
          { ...commit, repository: repositoryId },
          { upsert: true, new: true }
        );
        savedCommits.push(savedCommit);
      } catch (error) {
        console.error(`Error saving commit ${commit.hash}:`, error.message);
      }
    }

    return savedCommits;
  }

  async saveFiles(repositoryId, files) {
    const savedFiles = [];

    for (const file of files) {
      try {
        const savedFile = await File.findOneAndUpdate(
          { repository: repositoryId, path: file.path },
          { ...file, repository: repositoryId },
          { upsert: true, new: true }
        );
        savedFiles.push(savedFile);
      } catch (error) {
        console.error(`Error saving file ${file.path}:`, error.message);
      }
    }

    return savedFiles;
  }

  async extractFunctions(repositoryId, files) {
    const allFunctions = [];

    for (const file of files) {
      try {
        const parseResult = codeParser.parseFile(file.content, file.path, file.language);
        
        // Update file with imports/exports
        await File.findByIdAndUpdate(file._id, {
          imports: parseResult.imports,
          exports: parseResult.exports
        });

        // Save functions
        for (const func of parseResult.functions) {
          const savedFunction = await Function.findOneAndUpdate(
            { repository: repositoryId, file: file._id, name: func.name, startLine: func.startLine },
            {
              ...func,
              repository: repositoryId,
              file: file._id
            },
            { upsert: true, new: true }
          );
          allFunctions.push({ ...savedFunction.toObject(), filePath: file.path });
        }
      } catch (error) {
        console.error(`Error parsing file ${file.path}:`, error.message);
      }
    }

    return allFunctions;
  }

  async buildDependencyGraph(repositoryId, files, functions) {
    // Clear existing dependencies
    await Dependency.deleteMany({ repository: repositoryId });

    const fileMap = new Map(files.map(f => [f.path, f]));
    const functionMap = new Map(functions.map(f => [f.name, f]));

    // Build file-level dependencies based on imports
    for (const file of files) {
      if (!file.imports || file.imports.length === 0) continue;

      for (const importPath of file.imports) {
        // Try to resolve the import to a local file
        const resolvedFile = this.resolveImport(importPath, file.path, fileMap);
        
        const isExternal = !resolvedFile;
        
        await Dependency.create({
          repository: repositoryId,
          sourceType: 'file',
          sourceId: file._id,
          sourceModel: 'File',
          sourceName: file.path,
          targetType: isExternal ? 'external' : 'file',
          targetId: resolvedFile?._id || null,
          targetModel: resolvedFile ? 'File' : null,
          targetName: importPath,
          dependencyType: 'import',
          isExternal
        });
      }
    }

    // Build function-level dependencies based on calls
    for (const func of functions) {
      if (!func.calls || func.calls.length === 0) continue;

      for (const callName of func.calls) {
        const targetFunc = functionMap.get(callName);
        
        await Dependency.create({
          repository: repositoryId,
          sourceType: 'function',
          sourceId: func._id,
          sourceModel: 'Function',
          sourceName: func.name,
          targetType: targetFunc ? 'function' : 'external',
          targetId: targetFunc?._id || null,
          targetModel: targetFunc ? 'Function' : null,
          targetName: callName,
          dependencyType: 'call',
          isExternal: !targetFunc
        });
      }
    }
  }

  resolveImport(importPath, currentFilePath, fileMap) {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(currentFilePath);
      const possiblePaths = [
        path.join(currentDir, importPath),
        path.join(currentDir, importPath + '.js'),
        path.join(currentDir, importPath + '.ts'),
        path.join(currentDir, importPath + '.jsx'),
        path.join(currentDir, importPath + '.tsx'),
        path.join(currentDir, importPath, 'index.js'),
        path.join(currentDir, importPath, 'index.ts')
      ].map(p => p.replace(/\\/g, '/'));

      for (const possiblePath of possiblePaths) {
        const normalizedPath = possiblePath.replace(/^\.\//, '');
        if (fileMap.has(normalizedPath)) {
          return fileMap.get(normalizedPath);
        }
      }
    }

    // Handle absolute imports (from project root)
    const possiblePaths = [
      importPath,
      importPath + '.js',
      importPath + '.ts',
      importPath + '/index.js',
      importPath + '/index.ts'
    ];

    for (const possiblePath of possiblePaths) {
      if (fileMap.has(possiblePath)) {
        return fileMap.get(possiblePath);
      }
    }

    return null;
  }

  async generateEmbeddings(repositoryId, files, functions, commits) {
    // Clear existing embeddings
    await Embedding.deleteMany({ repository: repositoryId });

    const embeddings = [];

    // Generate embeddings for files (code content)
    for (const file of files) {
      if (file.content && file.content.length > 50) {
        try {
          const embedding = await embeddingService.generateEmbedding(file.content);
          embeddings.push({
            repository: repositoryId,
            entityType: 'file',
            entityId: file._id,
            entityName: file.path,
            content: file.content.substring(0, 2000),
            contentType: 'code',
            embedding,
            metadata: {
              filePath: file.path,
              language: file.language,
              lineCount: file.lineCount
            }
          });
        } catch (error) {
          console.error(`Error generating embedding for file ${file.path}:`, error.message);
        }
      }
    }

    // Generate embeddings for functions
    for (const func of functions) {
      if (func.code && func.code.length > 20) {
        try {
          const content = `Function ${func.name}: ${func.code}`;
          const embedding = await embeddingService.generateEmbedding(content);
          embeddings.push({
            repository: repositoryId,
            entityType: 'function',
            entityId: func._id,
            entityName: func.name,
            content: content.substring(0, 1000),
            contentType: 'code',
            embedding,
            metadata: {
              filePath: func.filePath,
              functionName: func.name,
              startLine: func.startLine,
              endLine: func.endLine
            }
          });
        } catch (error) {
          console.error(`Error generating embedding for function ${func.name}:`, error.message);
        }
      }
    }

    // Generate embeddings for significant commits
    const significantCommits = commits.slice(0, 50); // Top 50 recent commits
    for (const commit of significantCommits) {
      try {
        const content = `Commit: ${commit.message}. Changed files: ${commit.filesChanged?.map(f => f.filename).join(', ') || 'none'}`;
        const embedding = await embeddingService.generateEmbedding(content);
        embeddings.push({
          repository: repositoryId,
          entityType: 'commit',
          entityId: commit._id,
          entityName: commit.shortHash,
          content: content.substring(0, 500),
          contentType: 'commit_message',
          embedding,
          metadata: {
            commitHash: commit.hash,
            date: commit.date
          }
        });
      } catch (error) {
        console.error(`Error generating embedding for commit ${commit.shortHash}:`, error.message);
      }
    }

    // Batch insert embeddings
    if (embeddings.length > 0) {
      await Embedding.insertMany(embeddings, { ordered: false }).catch(err => {
        console.error('Error inserting embeddings:', err.message);
      });
    }

    return embeddings.length;
  }

  async calculateStats(repositoryId) {
    const [commitCount, fileCount, functionCount, dependencyCount] = await Promise.all([
      Commit.countDocuments({ repository: repositoryId }),
      File.countDocuments({ repository: repositoryId, isDeleted: false }),
      Function.countDocuments({ repository: repositoryId }),
      Dependency.countDocuments({ repository: repositoryId })
    ]);

    const files = await File.find({ repository: repositoryId }, 'language');
    const languages = [...new Set(files.map(f => f.language).filter(l => l && l !== 'unknown'))];

    return {
      totalCommits: commitCount,
      totalFiles: fileCount,
      totalFunctions: functionCount,
      totalDependencies: dependencyCount,
      languages
    };
  }
}

module.exports = new AnalysisService();
