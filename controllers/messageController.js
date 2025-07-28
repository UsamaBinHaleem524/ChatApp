const Message = require('../models/messageModel')
const Chat = require ('../models/chatModel')

const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
  
    if (!content || !chatId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const newMessage = await Message.create({
        sender: req.user._id,    // Comes from auth middleware
        content,
        chat: chatId,
      });
  
      const fullMessage = await newMessage.populate([
        { path: 'sender', select: 'name pic email' },
        { path: 'chat' },
      ]);
  
      // Optionally, populate users inside chat
      await fullMessage.populate({
        path: 'chat.users',
        select: 'name pic email',
      });
  
      // Update latestMessage in Chat
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: fullMessage,
      });
  
      res.status(201).json(fullMessage);
    } catch (error) {
      console.error('Send Message Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  module.exports = {sendMessage}