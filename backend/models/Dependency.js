const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  sourceType: {
    type: String,
    enum: ['file', 'function'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['File', 'Function'],
    required: true
  },
  sourceName: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['file', 'function', 'module', 'external'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    default: null
  },
  targetModel: {
    type: String,
    enum: ['File', 'Function', null],
    default: null
  },
  targetName: {
    type: String,
    required: true
  },
  dependencyType: {
    type: String,
    enum: ['import', 'call', 'extends', 'implements', 'uses'],
    required: true
  },
  isExternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient graph queries
dependencySchema.index({ repository: 1, sourceId: 1 });
dependencySchema.index({ repository: 1, targetId: 1 });
dependencySchema.index({ sourceType: 1, targetType: 1 });

module.exports = mongoose.model('Dependency', dependencySchema);
