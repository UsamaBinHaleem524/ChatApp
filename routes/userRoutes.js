const express = require('express');
const { registerUser, loginUser, searchUsers } = require('../controllers/userController');
const protect = require('../Middlewares/protect');


const router = express.Router();

// Register user
router.route('/').post(registerUser).get(protect,searchUsers);
router.post('/login', loginUser);

module.exports = router; 