const express = require('express');
const {  loginUser, registerUser, checkToken } = require('../controllers/AuthController');



const router = express.Router();

router.get("/checkToken", checkToken);
router.post("/register", registerUser);
router.post("/login", loginUser);



module.exports = router