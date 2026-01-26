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
