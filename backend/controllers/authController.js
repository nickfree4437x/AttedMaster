const authService = require('../services/authService');
const { validationResult } = require('express-validator');

exports.signup = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstname, lastname, email, userid, password } = req.body;
    const result = await authService.registerUser(firstname, lastname, email, userid, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || 'Internal Server Error' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { userid, password } = req.body;
    const result = await authService.authenticateUser(userid, password);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || 'Internal Server Error' 
    });
  }
};