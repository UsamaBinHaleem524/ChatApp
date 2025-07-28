const express = require('express');
const protect = require('../Middlewares/protect');
const { createChat, fetchChats, createGroupChat, renameGroupChat, addUserToGroup, removeUserFromGroup } = require('../controllers/chatController');


const router = express.Router();

// Register user
router.route('/').post(protect,createChat).get(protect,fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroupChat);
router.route('/groupremove').put(protect, removeUserFromGroup);
router.route('/groupadd').put(protect, addUserToGroup);

module.exports = router; 