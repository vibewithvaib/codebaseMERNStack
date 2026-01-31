const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'unknown'
  },
  content: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 0
  },
  lineCount: {
    type: Number,
    default: 0
  },
  lastModifiedCommit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commit'
  },
  imports: [{
    type: String
  }],
  exports: [{
    type: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
fileSchema.index({ repository: 1, path: 1 }, { unique: true });
fileSchema.index({ repository: 1, language: 1 });

module.exports = mongoose.model('File', fileSchema);
