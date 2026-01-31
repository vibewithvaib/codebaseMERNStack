const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  entityType: {
    type: String,
    enum: ['file', 'function', 'commit', 'code_chunk'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['code', 'description', 'commit_message', 'docstring'],
    default: 'code'
  },
  embedding: {
    type: [Number],
    required: true
  },
  metadata: {
    filePath: String,
    language: String,
    startLine: Number,
    endLine: Number,
    functionName: String,
    commitHash: String
  }
}, {
  timestamps: true
});

// Index for vector similarity search (basic implementation)
embeddingSchema.index({ repository: 1, entityType: 1 });
embeddingSchema.index({ entityId: 1 });

module.exports = mongoose.model('Embedding', embeddingSchema);
