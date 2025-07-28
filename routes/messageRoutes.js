const express = require('express');
const protect = require('../Middlewares/protect');
const { sendMessage } = require('../controllers/messageController');


const router = express.Router();

// Register user
router.route('/').post(protect,sendMessage);
// router.route('/:chatId').get(protect,allMessages);
// router.route('/group').post(protect, createGroupChat);
// router.route('/rename').put(protect, renameGroupChat);
// router.route('/groupremove').put(protect, removeUserFromGroup);
// router.route('/groupadd').put(protect, addUserToGroup);

module.exports = router; 