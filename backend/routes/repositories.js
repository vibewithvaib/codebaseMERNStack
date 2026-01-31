const express = require('express');
const router = express.Router();
const {
  getRepositories,
  getRepository,
  addRepository,
  deleteRepository,
  getCommits,
  getFiles,
  getFileContent,
  getFunctions,
  getDependencyGraph,
  getTimeline,
  reanalyzeRepository
} = require('../controllers/repositoryController');
const { askQuestion, getQuestionHistory } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Repository CRUD
router.get('/', getRepositories);
router.get('/:id', getRepository);
router.post('/', addRepository);
router.delete('/:id', deleteRepository);

// Repository analysis
router.post('/:id/analyze', reanalyzeRepository);

// Repository data
router.get('/:id/commits', getCommits);
router.get('/:id/files', getFiles);
router.get('/:id/files/:fileId', getFileContent);
router.get('/:id/functions', getFunctions);
router.get('/:id/graph', getDependencyGraph);
router.get('/:id/timeline', getTimeline);

// Q&A
router.post('/:id/ask', askQuestion);
router.get('/:id/questions', getQuestionHistory);

module.exports = router;
