const express = require('express');
const postMiddleware = require('../middleware/UserMiddleware');
const { createPost } = require('../controllers/PostController');
const { route } = require('../../auth-service/routes/AuthRoute');

const router = express.Router();

router.post("/create", postMiddleware, createPost);


module.exports = router