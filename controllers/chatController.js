const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const createChat = async (req, res) => {
  const { userId } = req.body; // ID of the second user to chat with

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if chat already exists between the two users
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $all: [req.user._id, userId],
        $size: 2,
      },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // If no chat exists, create a new one
    const newChat = await Chat.create({
      chatName: "sender", // can be changed as needed
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    return res.status(201).json(fullChat);
  } catch (error) {
    console.error("Create Chat Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $in: [req.user._id] } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email pic",
        },
      })
      .sort({ updatedAt: -1 }); // latest chat first

    res.status(200).json(chats);
  } catch (error) {
    console.error("Fetch Chats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createGroupChat = async (req, res) => {
  let users= JSON.parse(req.body.users);
  const { name} = req.body;

  // Validate input
  if (!name || !users || !Array.isArray(users) || users.length < 1) {
    return res.status(400).json({ message: 'Name and at least 1 user are required to create a group chat' });
  }

  try {
    // Add current user (creator) to the users array
    users.push(req.user._id);

    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user._id,
    });

    // Populate the response
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    return res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error('Group Chat Creation Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const renameGroupChat = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ message: 'chatId and chatName are required' });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Rename Group Chat Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const addUserToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: 'chatId and userId are required' });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Not a group chat' });
    }

    if (chat.users.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    chat.users.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Add User to Group Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const removeUserFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: 'chatId and userId are required' });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Not a group chat' });
    }

    // Optionally check if the requester is groupAdmin
    // if (String(chat.groupAdmin) !== String(req.user._id)) {
    //   return res.status(403).json({ message: 'Only group admin can remove users' });
    // }

    chat.users = chat.users.filter(
      (id) => String(id) !== String(userId)
    );

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Remove User Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { createChat, fetchChats, createGroupChat, renameGroupChat, addUserToGroup, removeUserFromGroup };
