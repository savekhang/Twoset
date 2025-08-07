// socket/index.js
const registerPresenceHandlers = require('./presence.socket');
const registerChatHandlers = require('./chat.socket');

module.exports = (io, onlineUsers) => {
  io.on('connection', (socket) => {
    registerPresenceHandlers(io, socket, onlineUsers);
    registerChatHandlers(io, socket, onlineUsers);
  });
};
