const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['function', 'method', 'class', 'arrow', 'async', 'generator', 'constructor'],
    default: 'function'
  },
  startLine: {
    type: Number,
    required: true
  },
  endLine: {
    type: Number,
    required: true
  },
  parameters: [{
    name: String,
    type: String,
    defaultValue: String
  }],
  returnType: {
    type: String,
    default: 'unknown'
  },
  isExported: {
    type: Boolean,
    default: false
  },
  isAsync: {
    type: Boolean,
    default: false
  },
  complexity: {
    type: Number,
    default: 1
  },
  calls: [{
    type: String // function names that this function calls
  }],
  calledBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Function'
  }],
  docstring: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
functionSchema.index({ repository: 1, name: 1 });
functionSchema.index({ file: 1 });

module.exports = mongoose.model('Function', functionSchema);
