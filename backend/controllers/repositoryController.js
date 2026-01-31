const { Repository, Commit, File, Function, Dependency, Embedding, Question, Answer } = require('../models');
const gitService = require('../services/gitService');
const analysisService = require('../services/analysisService');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all repositories for user
// @route   GET /api/repositories
// @access  Private
exports.getRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({
      user: req.user._id,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repositories.length,
      data: repositories
    });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching repositories'
    });
  }
};

// @desc    Get single repository
// @route   GET /api/repositories/:id
// @access  Private
exports.getRepository = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    res.status(200).json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error('Get repository error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching repository'
    });
  }
};

// @desc    Add new repository
// @route   POST /api/repositories
// @access  Private
exports.addRepository = async (req, res) => {
  try {
    const { source, path: repoPath, url } = req.body;

    if (!source || (source === 'local' && !repoPath) || (source === 'github' && !url)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide source type and path or URL'
      });
    }

    let repoName;
    let originalPath;
    let sourceType;

    if (source === 'github') {
      const urlParts = url.replace(/\.git$/, '').split('/');
      repoName = urlParts[urlParts.length - 1] || 'unknown-repo';
      originalPath = url;
      sourceType = 'github';
    } else {
      repoName = path.basename(repoPath);
      originalPath = repoPath;
      sourceType = 'local';

      // Validate local path exists
      try {
        await fs.access(repoPath);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Local path does not exist'
        });
      }

      // Validate git repository
      const isGit = await gitService.validateRepository(repoPath);
      if (!isGit) {
        return res.status(400).json({
          success: false,
          message: 'Path is not a valid git repository'
        });
      }
    }

    // 🔥 IMPORTANT: Do NOT pass empty string for localPath
    const repository = await Repository.create({
      user: req.user._id,
      name: repoName,
      originalPath,
      sourceType,
      githubUrl: source === 'github' ? url : null,
      status: 'pending',
      statusMessage: 'Waiting for processing...',
      localPath: null
    });

    // Start async processing safely
    processRepository(repository._id, sourceType, originalPath, req.user._id)
      .catch(err => console.error('Background processing error:', err));

    res.status(201).json({
      success: true,
      message: 'Repository added. Analysis started.',
      data: repository
    });

  } catch (error) {
    console.error('Add repository error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding repository'
    });
  }
};


// Async function to process repository
async function processRepository(repoId, source, originalPath, userId) {
  try {
    let localPath;

    if (source === 'github') {
      // Clone from GitHub
      await Repository.findByIdAndUpdate(repoId, {
        status: 'cloning',
        statusMessage: 'Cloning repository...'
      });
      localPath = await gitService.cloneRepository(originalPath, userId, repoId);
    } else {
      // Copy local repository
      await Repository.findByIdAndUpdate(repoId, {
        status: 'cloning',
        statusMessage: 'Copying repository...'
      });
      localPath = await gitService.copyLocalRepository(originalPath, userId, repoId);
    }

    // Update local path
    await Repository.findByIdAndUpdate(repoId, { localPath });

    // Start analysis
    await analysisService.analyzeRepository(repoId);
  } catch (error) {
    console.error('Process repository error:', error);
    await Repository.findByIdAndUpdate(repoId, {
      status: 'error',
      statusMessage: error.message
    });
  }
}

// @desc    Delete repository (soft delete)
// @route   DELETE /api/repositories/:id
// @access  Private
exports.deleteRepository = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    // Soft delete
    await Repository.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Repository deleted successfully'
    });
  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting repository'
    });
  }
};

// @desc    Get repository commits
// @route   GET /api/repositories/:id/commits
// @access  Private
exports.getCommits = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const commits = await Commit.find({ repository: req.params.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Commit.countDocuments({ repository: req.params.id });

    res.status(200).json({
      success: true,
      count: commits.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: commits
    });
  } catch (error) {
    console.error('Get commits error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching commits'
    });
  }
};

// @desc    Get repository files
// @route   GET /api/repositories/:id/files
// @access  Private
exports.getFiles = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const files = await File.find({
      repository: req.params.id,
      isDeleted: false
    }).select('-content');

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching files'
    });
  }
};

// @desc    Get single file with content
// @route   GET /api/repositories/:id/files/:fileId
// @access  Private
exports.getFileContent = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const file = await File.findOne({
      _id: req.params.fileId,
      repository: req.params.id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching file'
    });
  }
};

// @desc    Get repository functions
// @route   GET /api/repositories/:id/functions
// @access  Private
exports.getFunctions = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const functions = await Function.find({ repository: req.params.id })
      .populate('file', 'path filename');

    res.status(200).json({
      success: true,
      count: functions.length,
      data: functions
    });
  } catch (error) {
    console.error('Get functions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching functions'
    });
  }
};

// @desc    Get dependency graph
// @route   GET /api/repositories/:id/graph
// @access  Private
exports.getDependencyGraph = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const graphType = req.query.type || 'file'; // 'file' or 'function'

    // Get nodes
    let nodes = [];
    if (graphType === 'file') {
      const files = await File.find({
        repository: req.params.id,
        isDeleted: false
      }).select('_id path filename language lineCount');
      
      nodes = files.map(f => ({
        id: f._id.toString(),
        label: f.filename,
        path: f.path,
        type: 'file',
        language: f.language,
        size: f.lineCount || 10
      }));
    } else {
      const functions = await Function.find({ repository: req.params.id })
        .populate('file', 'path');
      
      nodes = functions.map(f => ({
        id: f._id.toString(),
        label: f.name,
        path: f.file?.path,
        type: f.type,
        isAsync: f.isAsync,
        size: (f.endLine - f.startLine) || 5
      }));
    }

    // Get edges (dependencies)
    const dependencies = await Dependency.find({
      repository: req.params.id,
      sourceType: graphType
    });

    const edges = dependencies
      .filter(d => d.targetId) // Only internal dependencies
      .map(d => ({
        source: d.sourceId.toString(),
        target: d.targetId.toString(),
        type: d.dependencyType,
        label: d.dependencyType
      }));

    res.status(200).json({
      success: true,
      data: {
        nodes,
        edges,
        graphType
      }
    });
  } catch (error) {
    console.error('Get dependency graph error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dependency graph'
    });
  }
};

// @desc    Get evolution timeline
// @route   GET /api/repositories/:id/timeline
// @access  Private
exports.getTimeline = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const commits = await Commit.find({ repository: req.params.id })
      .sort({ date: 1 })
      .select('shortHash date message stats filesChanged author');

    // Group commits by date for timeline
    const timelineData = commits.map(commit => ({
      hash: commit.shortHash,
      date: commit.date,
      message: commit.message,
      author: commit.author?.name,
      filesChanged: commit.stats?.filesChangedCount || commit.filesChanged?.length || 0,
      additions: commit.stats?.totalAdditions || 0,
      deletions: commit.stats?.totalDeletions || 0,
      files: commit.filesChanged?.map(f => f.filename) || []
    }));

    // Calculate daily stats
    const dailyStats = {};
    commits.forEach(commit => {
      const dateKey = commit.date.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          commits: 0,
          filesChanged: 0,
          additions: 0,
          deletions: 0
        };
      }
      dailyStats[dateKey].commits += 1;
      dailyStats[dateKey].filesChanged += commit.stats?.filesChangedCount || 0;
      dailyStats[dateKey].additions += commit.stats?.totalAdditions || 0;
      dailyStats[dateKey].deletions += commit.stats?.totalDeletions || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        commits: timelineData,
        dailyStats: Object.values(dailyStats),
        totalCommits: commits.length
      }
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching timeline'
    });
  }
};

// @desc    Re-analyze repository
// @route   POST /api/repositories/:id/analyze
// @access  Private
exports.reanalyzeRepository = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (repository.status === 'analyzing') {
      return res.status(400).json({
        success: false,
        message: 'Repository is already being analyzed'
      });
    }

    // Start re-analysis
    analysisService.analyzeRepository(repository._id);

    res.status(200).json({
      success: true,
      message: 'Re-analysis started'
    });
  } catch (error) {
    console.error('Reanalyze repository error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error re-analyzing repository'
    });
  }
};
