const OpenAI = require('openai');
const { Repository, File, Function, Commit, Dependency, Embedding, Question, Answer } = require('../models');
const embeddingService = require('./embeddingService');

class RAGService {
  constructor() {
    this.openai = null;
  }

  initialize() {
    if (!this.openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async askQuestion(userId, repositoryId, questionText) {
    const startTime = Date.now();
    
    // Create question record
    const question = await Question.create({
      user: userId,
      repository: repositoryId,
      question: questionText,
      status: 'processing'
    });

    try {
      // Step 1: Generate embedding for the question
      const questionEmbedding = await embeddingService.generateEmbedding(questionText);

      // Step 2: Retrieve relevant context
      const context = await this.retrieveContext(repositoryId, questionEmbedding, questionText);

      // Step 3: Build prompt with context
      const prompt = this.buildPrompt(questionText, context);

      // Step 4: Get answer from LLM
      const llmResponse = await this.getAnswer(prompt);

      // Step 5: Extract sources
      const sources = this.extractSources(context);

      // Step 6: Create answer record
      const processingTime = Date.now() - startTime;
      
      const answer = await Answer.create({
        question: question._id,
        answer: llmResponse.answer,
        explanation: llmResponse.explanation,
        sources,
        context: {
          retrievedChunks: context.chunks.map(c => ({
            content: c.content.substring(0, 500),
            source: c.source,
            score: c.score
          })),
          totalTokensUsed: llmResponse.tokensUsed || 0
        },
        confidence: llmResponse.confidence || 0.7,
        processingTime
      });

      // Update question status
      await Question.findByIdAndUpdate(question._id, { status: 'completed' });

      return {
        questionId: question._id,
        question: questionText,
        answer: answer.answer,
        explanation: answer.explanation,
        sources: answer.sources,
        confidence: answer.confidence,
        processingTime
      };
    } catch (error) {
      console.error('RAG error:', error);
      await Question.findByIdAndUpdate(question._id, { status: 'error' });
      throw error;
    }
  }

  async retrieveContext(repositoryId, queryEmbedding, queryText) {
    // Get all embeddings for the repository
    const embeddings = await Embedding.find({ repository: repositoryId }).lean();

    // Find similar embeddings
    const similar = embeddingService.findSimilar(queryEmbedding, embeddings, 10);

    // Get additional context based on query keywords
    const keywords = this.extractKeywords(queryText);
    
    // Search for relevant files
    const relevantFiles = await File.find({
      repository: repositoryId,
      $or: [
        { path: { $regex: keywords.join('|'), $options: 'i' } },
        { content: { $regex: keywords.slice(0, 3).join('|'), $options: 'i' } }
      ]
    }).limit(5).lean();

    // Search for relevant functions
    const relevantFunctions = await Function.find({
      repository: repositoryId,
      $or: [
        { name: { $regex: keywords.join('|'), $options: 'i' } },
        { code: { $regex: keywords.slice(0, 3).join('|'), $options: 'i' } }
      ]
    }).limit(10).lean();

    // Search for relevant commits
    const relevantCommits = await Commit.find({
      repository: repositoryId,
      message: { $regex: keywords.slice(0, 5).join('|'), $options: 'i' }
    }).limit(5).lean();

    // Get dependency graph context
    const graphContext = await this.getGraphContext(repositoryId, relevantFiles, relevantFunctions);

    // Combine all context
    const chunks = [];

    // Add embedding-based results
    for (const item of similar) {
      chunks.push({
        content: item.content,
        source: `${item.entityType}: ${item.entityName}`,
        score: item.score,
        type: item.entityType,
        metadata: item.metadata
      });
    }

    // Add file context
    for (const file of relevantFiles) {
      if (!chunks.find(c => c.source.includes(file.path))) {
        chunks.push({
          content: file.content?.substring(0, 1500) || '',
          source: `file: ${file.path}`,
          score: 0.5,
          type: 'file',
          metadata: { filePath: file.path, language: file.language }
        });
      }
    }

