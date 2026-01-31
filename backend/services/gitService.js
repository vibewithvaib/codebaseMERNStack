const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const { Repository, Commit, File, Function, Dependency, Embedding } = require('../models');

class GitService {
  constructor() {
    this.basePath = process.env.REPOS_BASE_PATH || './repositories';
  }

  async ensureBasePath() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Error creating base path:', error);
    }
  }

  async cloneRepository(url, userId, repoId) {
    await this.ensureBasePath();
    const localPath = path.join(this.basePath, userId.toString(), repoId.toString());
    
    try {
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      const git = simpleGit();
      await git.clone(url, localPath);
      return localPath;
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  async copyLocalRepository(sourcePath, userId, repoId) {
    await this.ensureBasePath();
    const localPath = path.join(this.basePath, userId.toString(), repoId.toString());
    
    try {
      await fs.mkdir(localPath, { recursive: true });
      await this.copyDirectory(sourcePath, localPath);
      return localPath;
    } catch (error) {
      console.error('Error copying repository:', error);
      throw new Error(`Failed to copy repository: ${error.message}`);
    }
  }

  async copyDirectory(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async validateRepository(repoPath) {
    try {
      const git = simpleGit(repoPath);
      const isRepo = await git.checkIsRepo();
      return isRepo;
    } catch (error) {
      return false;
    }
  }

  async getCommitHistory(repoPath, maxCommits = 500) {
    const git = simpleGit(repoPath);
    
    try {
      const log = await git.log({ maxCount: maxCommits });
      const commits = [];

      for (const commit of log.all) {
        try {
          // Get diff stats for each commit
          let diffSummary = { files: [], insertions: 0, deletions: 0 };
          try {
            if (commit.hash) {
              const parentHash = commit.hash + '^';
              diffSummary = await git.diffSummary([parentHash, commit.hash]).catch(() => ({
                files: [],
                insertions: 0,
                deletions: 0
              }));
            }
          } catch (e) {
            // First commit or error - skip diff
          }

          commits.push({
            hash: commit.hash,
            shortHash: commit.hash.substring(0, 7),
            author: {
              name: commit.author_name,
              email: commit.author_email
            },
            date: new Date(commit.date),
            message: commit.message,
            filesChanged: (diffSummary.files || []).map(f => ({
              filename: f.file,
              additions: f.insertions || 0,
              deletions: f.deletions || 0,
              status: f.binary ? 'binary' : 'modified'
            })),
            stats: {
              totalAdditions: diffSummary.insertions || 0,
              totalDeletions: diffSummary.deletions || 0,
              filesChangedCount: (diffSummary.files || []).length
            },
            parentHashes: commit.refs ? [commit.refs] : []
          });
        } catch (commitError) {
          console.error(`Error processing commit ${commit.hash}:`, commitError);
        }
      }

      return commits;
    } catch (error) {
      console.error('Error getting commit history:', error);
      return [];
    }
  }

  async getRepositoryFiles(repoPath) {
    const files = [];
    await this.walkDirectory(repoPath, repoPath, files);
    return files;
  }

  async walkDirectory(basePath, currentPath, files, maxDepth = 10, currentDepth = 0) {
    if (currentDepth > maxDepth) return;

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);

        // Skip hidden files, node_modules, .git, etc.
        if (this.shouldSkip(entry.name, relativePath)) continue;

        if (entry.isDirectory()) {
          await this.walkDirectory(basePath, fullPath, files, maxDepth, currentDepth + 1);
        } else if (entry.isFile()) {
          try {
            const stats = await fs.stat(fullPath);
            const ext = path.extname(entry.name);
            
            // Skip large files (> 1MB) and binary files
            if (stats.size > 1024 * 1024) continue;
            if (this.isBinaryExtension(ext)) continue;

            let content = '';
            try {
              content = await fs.readFile(fullPath, 'utf-8');
            } catch (e) {
              // Binary or unreadable file
              continue;
            }

            files.push({
              path: relativePath,
              filename: entry.name,
              extension: ext,
              language: this.getLanguage(ext),
              content,
              size: stats.size,
              lineCount: content.split('\n').length
            });
          } catch (e) {
            // Skip files we can't read
          }
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${currentPath}:`, error);
    }
  }

  shouldSkip(name, relativePath) {
    const skipPatterns = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      '__pycache__',
      '.DS_Store',
      'dist',
      'build',
      'coverage',
      '.next',
      '.nuxt',
      'vendor',
      '.idea',
      '.vscode',
      '*.min.js',
      '*.map',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ];

    return skipPatterns.some(pattern => {
      if (pattern.startsWith('*')) {
        return name.endsWith(pattern.slice(1));
      }
      return name === pattern || relativePath.includes(`/${pattern}/`) || relativePath.startsWith(`${pattern}/`);
    });
  }

  isBinaryExtension(ext) {
    const binaryExts = [
      '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx',
      '.zip', '.tar', '.gz', '.rar',
      '.exe', '.dll', '.so', '.dylib',
      '.woff', '.woff2', '.ttf', '.eot',
      '.mp3', '.mp4', '.wav', '.avi',
      '.sqlite', '.db'
    ];
    return binaryExts.includes(ext.toLowerCase());
  }

  getLanguage(ext) {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp',
      '.cs': 'csharp',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.rs': 'rust',
      '.scala': 'scala',
      '.vue': 'vue',
      '.svelte': 'svelte',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      '.dockerfile': 'dockerfile'
    };
    return languageMap[ext.toLowerCase()] || 'unknown';
  }
}

module.exports = new GitService();
