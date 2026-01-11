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
