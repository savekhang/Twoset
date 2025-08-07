// socket/presence.socket.js
const registerPresenceHandlers = (io, socket, onlineUsers) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} online với socketId ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} đã offline`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
};

module.exports = registerPresenceHandlers;
