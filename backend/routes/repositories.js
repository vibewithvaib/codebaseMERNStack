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
