import Message from "../models/Message.js";

// @desc    Get chat message history for a specific room
// @route   GET /api/chat/history/:chatRoom
export const getChatHistory = async (req, res) => {
  try {
    const { chatRoom } = req.params;

    const messages = await Message.find({ chatRoom }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to load chat history", error: error.message });
  }
};

// @desc    Get list of all active chat rooms (For Admin Panel)
// @route   GET /api/chat/rooms
export const getActiveRooms = async (req, res) => {
  try {
    // Group messages by chatRoom and pick the latest message per room
    const rooms = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chatRoom",
          lastMessage: { $first: "$text" },
          lastSender: { $first: "$senderName" },
          updatedAt: { $first: "$createdAt" },
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat rooms", error: error.message });
  }
};