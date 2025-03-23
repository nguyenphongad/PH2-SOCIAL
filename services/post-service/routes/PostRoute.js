const express = require('express');
const postMiddleware = require('../middleware/PostMiddleware');
const { createPost } = require('../controllers/PostController');
const { route } = require('../../auth-service/routes/AuthRoute');

const router = express.Router();

router.post("/create", postMiddleware, createPost);


module.exports = router