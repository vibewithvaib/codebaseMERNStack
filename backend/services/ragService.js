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

    // Add function context
    for (const func of relevantFunctions) {
      chunks.push({
        content: `Function ${func.name} (${func.type}): ${func.code?.substring(0, 500) || ''}`,
        source: `function: ${func.name}`,
        score: 0.6,
        type: 'function',
        metadata: { functionName: func.name, startLine: func.startLine, endLine: func.endLine }
      });
    }

    return {
      chunks: chunks.slice(0, 15),
      files: relevantFiles,
      functions: relevantFunctions,
      commits: relevantCommits,
      graph: graphContext
    };
  }

  extractKeywords(text) {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'this', 'that', 'it', 'as',
      'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'can', 'what', 'where', 'when', 'why', 'how', 'who',
      'if', 'then', 'else', 'all', 'any', 'both', 'each', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)];
  }

  async getGraphContext(repositoryId, files, functions) {
    const fileIds = files.map(f => f._id);
    const functionIds = functions.map(f => f._id);

    // Get dependencies involving these files/functions
    const dependencies = await Dependency.find({
      repository: repositoryId,
      $or: [
        { sourceId: { $in: [...fileIds, ...functionIds] } },
        { targetId: { $in: [...fileIds, ...functionIds] } }
      ]
    }).limit(50).lean();

    return {
      nodes: [
        ...files.map(f => ({ id: f._id.toString(), type: 'file', name: f.path })),
        ...functions.map(f => ({ id: f._id.toString(), type: 'function', name: f.name }))
      ],
      edges: dependencies.map(d => ({
        source: d.sourceId?.toString(),
        target: d.targetId?.toString(),
        type: d.dependencyType
      }))
    };
  }

  buildPrompt(question, context) {
    const contextText = context.chunks
      .map((chunk, i) => `[Source ${i + 1}: ${chunk.source}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    const graphInfo = context.graph.nodes.length > 0
      ? `\n\nRelated code structure:\n- Files: ${context.graph.nodes.filter(n => n.type === 'file').map(n => n.name).join(', ')}\n- Functions: ${context.graph.nodes.filter(n => n.type === 'function').map(n => n.name).join(', ')}`
      : '';

    return `You are a code expert assistant helping developers understand their codebase.

CONTEXT FROM THE CODEBASE:
${contextText}
${graphInfo}

QUESTION: ${question}

INSTRUCTIONS:
1. Answer the question based ONLY on the provided context
2. Be specific and reference actual code, files, and functions from the context
3. If you cannot find the answer in the context, say so clearly
4. Explain your reasoning step by step
5. Reference the sources you used

Provide your response in the following format:

ANSWER:
[Your direct answer to the question]

EXPLANATION:
[Detailed explanation with references to specific code and files]

SOURCES USED:
[List the specific files, functions, or commits you referenced]`;
  }

  async getAnswer(prompt) {
    this.initialize();

    if (!this.openai) {
      // Fallback response when no API key
      return {
        answer: "I found relevant code in the codebase that may help answer your question. However, to provide detailed AI-powered analysis, please configure your OpenAI API key in the .env file.",
        explanation: "The retrieval system found matching files and functions based on your query. The context includes code snippets that are semantically similar to your question. To get a full AI-generated explanation, add your OPENAI_API_KEY to the backend .env file.",
        confidence: 0.5,
        tokensUsed: 0
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code assistant that explains codebases clearly and accurately. Always base your answers on the provided context and cite your sources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      const responseText = response.choices[0].message.content;
      
      // Parse the response
      const answerMatch = responseText.match(/ANSWER:\s*([\s\S]*?)(?=EXPLANATION:|$)/i);
      const explanationMatch = responseText.match(/EXPLANATION:\s*([\s\S]*?)(?=SOURCES USED:|$)/i);

      return {
        answer: answerMatch ? answerMatch[1].trim() : responseText,
        explanation: explanationMatch ? explanationMatch[1].trim() : '',
        confidence: 0.8,
        tokensUsed: response.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        answer: "I encountered an error while generating the response. Please check the context and try again.",
        explanation: error.message,
        confidence: 0.3,
        tokensUsed: 0
      };
    }
  }

  extractSources(context) {
    return {
      files: context.files.map(f => ({
        fileId: f._id,
        path: f.path,
        relevanceScore: 0.8
      })),
      functions: context.functions.map(f => ({
        functionId: f._id,
        name: f.name,
        filePath: f.filePath || 'unknown',
        relevanceScore: 0.7
      })),
      commits: context.commits.map(c => ({
        commitId: c._id,
        hash: c.shortHash,
        message: c.message,
        date: c.date,
        relevanceScore: 0.6
      })),
      graphNodes: context.graph.nodes.map(n => ({
        nodeId: n.id,
        nodeType: n.type,
        nodeName: n.name,
        connections: context.graph.edges.filter(e => e.source === n.id || e.target === n.id).length
      }))
    };
  }

  async getQuestionHistory(userId, repositoryId) {
    const questions = await Question.find({
      user: userId,
      repository: repositoryId
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answer = await Answer.findOne({ question: q._id }).lean();
        return {
          ...q,
          answer: answer || null
        };
      })
    );

    return questionsWithAnswers;
  }

  async getQuestionDetail(questionId) {
    const question = await Question.findById(questionId).lean();
    if (!question) {
      throw new Error('Question not found');
    }

    const answer = await Answer.findOne({ question: questionId }).lean();

    return {
      ...question,
      answer
    };
  }
}

module.exports = new RAGService();
