const express = require('express');
const router = express.Router();
const { getQuestion, getAllQuestions } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.use(protect);

