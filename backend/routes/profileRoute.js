// routes/profileRoute.js

const express = require('express');
const { getAdminProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Define the /api/admin/profile route, protected by authMiddleware
router.get('/profile', authMiddleware, getAdminProfile);

module.exports = router;
