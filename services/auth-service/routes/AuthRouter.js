const express = require('express');
const {  loginUser } = require('../controllers/AuthController');



const router = express.Router();

// router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router