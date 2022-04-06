const User = require("../models/userModel");

module.exports = (io, socket) => {
  socket.on("BE_notify_friend", async ({ friendId, userName, _id, avatar }) => {
    try {
      let friend = await User.findById(friendId);
      let sockets = friend.sockets;
      for (const socket of sockets) {
        io.to(socket.socket).emit("FE_receive_friend_request", {
          userName,
          _id,
          avatar,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  });
  socket.on("BE_accept_friend_request", async (friendId) => {
    try {
      let friend = await User.findById(friendId);
      let sockets = friend.sockets;
      for (const socket of sockets) {
        io.to(socket.socket).emit("FE_accept_friend_request", "sasdasdas");
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};
