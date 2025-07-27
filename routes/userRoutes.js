const express = require('express');
const { registerUser } = require('../controllers/userController');

const router = express.Router();

// Register user
router.route('/').post(registerUser);

module.exports = router; 