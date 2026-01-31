const { Repository, Question, Answer } = require('../models');
const ragService = require('../services/ragService');

// @desc    Ask a question about repository
// @route   POST /api/repositories/:id/ask
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      });
    }

    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (repository.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Repository analysis is not complete. Please wait until status is ready.'
      });
    }

    // Process question with RAG
    const result = await ragService.askQuestion(
      req.user._id,
      req.params.id,
      question.trim()
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing question'
    });
  }
};

// @desc    Get question history for repository
// @route   GET /api/repositories/:id/questions
// @access  Private
exports.getQuestionHistory = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const history = await ragService.getQuestionHistory(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get question history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching question history'
    });
  }
};

// @desc    Get single question with answer
// @route   GET /api/questions/:id
// @access  Private
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Verify ownership
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this question'
      });
    }

    const result = await ragService.getQuestionDetail(req.params.id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching question'
    });
  }
};

// @desc    Get all questions for user across all repos
// @route   GET /api/questions
// @access  Private
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id })
      .populate('repository', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answer = await Answer.findOne({ question: q._id }).select('answer confidence processingTime');
        return {
          ...q.toObject(),
          answer: answer || null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: questionsWithAnswers.length,
      data: questionsWithAnswers
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching questions'
    });
  }
};
