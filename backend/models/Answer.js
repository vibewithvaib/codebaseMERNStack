const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  sources: {
    files: [{
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
      path: String,
      relevanceScore: Number
    }],
    functions: [{
      functionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Function' },
      name: String,
      filePath: String,
      relevanceScore: Number
    }],
    commits: [{
      commitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commit' },
      hash: String,
      message: String,
      date: Date,
      relevanceScore: Number
    }],
    graphNodes: [{
      nodeId: String,
      nodeType: String,
      nodeName: String,
      connections: Number
    }]
  },
  context: {
    retrievedChunks: [{
      content: String,
      source: String,
      score: Number
    }],
    totalTokensUsed: Number
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
