const express = require('express');
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validators');

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

module.exports = router;