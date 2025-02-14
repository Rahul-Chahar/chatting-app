// controllers/socketController.js
module.exports = function(io) {
  const db = require('../models');
  
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a group room.
    socket.on('joinGroup', (groupId) => {
      console.log(`Socket ${socket.id} joining group ${groupId}`);
      socket.join("group_" + groupId);
    });

    // Leave a group room.
    socket.on('leaveGroup', (groupId) => {
      console.log(`Socket ${socket.id} leaving group ${groupId}`);
      socket.leave("group_" + groupId);
    });

    // Listen for new group messages.
socket.on('sendGroupMessage', async (data) => {
  console.log("Received group message:", data);
  try {
    // Verify membership first
    const membership = await db.GroupMember.findOne({
      where: { 
        groupId: data.groupId,
        userId: data.senderId
      }
    });

    if (!membership) {
      socket.emit("errorMessage", { message: "Not authorized to send messages to this group." });
      return;
    }

    // Save the message to the database
    const newMessage = await db.GroupMessage.create({
      senderId: data.senderId,
      groupId: data.groupId,
      message: data.message
    });

    console.log("Stored group message:", newMessage.toJSON());
    io.to("group_" + data.groupId).emit('newGroupMessage', newMessage);
  } catch (err) {
    console.error("Error storing group message:", err);
    socket.emit("errorMessage", { message: "Failed to store message." });
  }
});

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
