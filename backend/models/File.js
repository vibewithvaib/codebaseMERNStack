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
