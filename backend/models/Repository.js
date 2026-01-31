const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Repository name is required'],
    trim: true
  },
  originalPath: {
    type: String,
    required: true
  },
  localPath: {
    type: String,
    default:null
  },
  sourceType: {
    type: String,
    enum: ['local', 'github'],
    required: true
  },
  githubUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'cloning', 'analyzing', 'ready', 'error', 'deleted'],
    default: 'pending'
  },
  statusMessage: {
    type: String,
    default: ''
  },
  analysisProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stats: {
    totalCommits: { type: Number, default: 0 },
    totalFiles: { type: Number, default: 0 },
    totalFunctions: { type: Number, default: 0 },
    totalDependencies: { type: Number, default: 0 },
    languages: [{ type: String }]
  },
  lastAnalyzedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
repositorySchema.index({ user: 1, isDeleted: 1 });
repositorySchema.index({ status: 1 });

module.exports = mongoose.model('Repository', repositorySchema);
