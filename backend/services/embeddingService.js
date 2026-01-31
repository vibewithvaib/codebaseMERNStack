const OpenAI = require('openai');

class EmbeddingService {
  constructor() {
    this.openai = null;
    this.embeddingDimension = 1536; // text-embedding-ada-002 dimension
  }

  initialize() {
    if (!this.openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async generateEmbedding(text) {
    this.initialize();
    
    if (!this.openai) {
      // Return a deterministic pseudo-embedding if no API key
      return this.generatePseudoEmbedding(text);
    }

    try {
      // Truncate text to fit token limit
      const truncatedText = text.substring(0, 8000);
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: truncatedText
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      return this.generatePseudoEmbedding(text);
    }
  }

  generatePseudoEmbedding(text) {
    // Generate a deterministic pseudo-embedding based on text content
    // This allows the app to work without an OpenAI API key
    const embedding = new Array(this.embeddingDimension).fill(0);
    
    // Simple hash-based embedding
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1)) % this.embeddingDimension;
      embedding[index] += Math.sin(charCode * 0.01) * 0.1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
    return embedding.map(val => val / magnitude);
  }

  async generateBatchEmbeddings(texts) {
    this.initialize();
    
    if (!this.openai) {
      return texts.map(text => this.generatePseudoEmbedding(text));
    }

    try {
      const truncatedTexts = texts.map(t => t.substring(0, 8000));
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: truncatedTexts
      });

      return response.data.map(d => d.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error.message);
      return texts.map(text => this.generatePseudoEmbedding(text));
    }
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  findSimilar(queryEmbedding, embeddings, topK = 5) {
    const similarities = embeddings.map((emb, index) => ({
      index,
      score: this.cosineSimilarity(queryEmbedding, emb.embedding),
      ...emb
    }));

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

module.exports = new EmbeddingService();
