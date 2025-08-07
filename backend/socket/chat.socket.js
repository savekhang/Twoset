// socket/chat.socket.js
const registerChatHandlers = (io, socket, onlineUsers) => {
  socket.on('send_message', (data) => {
    const { sender_id, receiver_id, content } = data;

    if (!sender_id || !receiver_id || !content) return;

    const message = {
      sender_id,
      receiver_id,
      content,
      sent_at: new Date().toISOString(),
    };

    const receiverSocketId = onlineUsers.get(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', message);
    }
  });
};

module.exports = registerChatHandlers;
