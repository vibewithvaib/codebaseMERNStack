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
