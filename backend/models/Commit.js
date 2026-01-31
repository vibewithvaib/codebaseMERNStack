const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  hash: {
    type: String,
    required: true
  },
  shortHash: {
    type: String,
    required: true
  },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  date: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  filesChanged: [{
    filename: String,
    additions: Number,
    deletions: Number,
    status: String // added, modified, deleted, renamed
  }],
  stats: {
    totalAdditions: { type: Number, default: 0 },
    totalDeletions: { type: Number, default: 0 },
    filesChangedCount: { type: Number, default: 0 }
  },
  parentHashes: [{ type: String }]
}, {
  timestamps: true
});

// Compound index for efficient lookups
commitSchema.index({ repository: 1, hash: 1 }, { unique: true });
commitSchema.index({ repository: 1, date: -1 });

module.exports = mongoose.model('Commit', commitSchema);
