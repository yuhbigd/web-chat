const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/userModel");

module.exports = (io, socket) => {
  socket.on("BE_notify_friend", async ({ friendId, userName, _id, avatar }) => {
    try {
      let friend = await User.findOne({ _id: friendId });
      let friendOfFriend = friend.friends;

      //khong the gui loi moi ket ban den ban cua minh
      for (const friend of friendOfFriend) {
        if (friend.info.toHexString() === _id) {
          return;
        }
      }

      const friendRequestNotifications = friend.friendRequestNotifications;
      //moi nguoi chi co the gui 1 loi moi ket ban den 1 ban
      for (const friendRequest of friendRequestNotifications) {
        if (friendRequest.friendId === _id) {
          return;
        }
      }

      let updatedUser = await User.findOneAndUpdate(
        {
          _id: friendId,
        },
        {
          $push: {
            friendRequestNotifications: {
              message: `${userName} muốn kết bạn với bạn`,
              userName,
              avatar,
              friendId: _id,
            },
          },
        },
        { new: true },
      );

      let sockets = friend.sockets;
      // gui yeu cau ket ban den tat ca socket
      for (const socket of sockets) {
        io.to(socket.socket).emit("FE_receive_friend_request", {
          notifications: updatedUser.friendRequestNotifications,
        });
      }
      const message = {
        notification: {
          title: "Lời mời kết bạn",
          body: `${userName} muốn kết bạn với bạn`,
        },
        topic: friend._id.toHexString(),
        webpush: {
          fcmOptions: {
            link: "/",
          },
        },
      };
      getMessaging()
        .send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    } catch (error) {
      console.log(error.message);
    }
  });
  // khi client chap nhan ket ban
  socket.on(
    "BE_accept_friend_request",
    async ({ friendId, notificationId }) => {
      try {
        let friend = await User.findOneAndUpdate(
          {
            _id: friendId,
          },
          {
            $push: {
              friends: {
                info: socket.userId,
              },
            },
          },
          { new: true },
        );
        let sockets = friend.sockets;
        // cap nhat ban o tat cac cac socket
        for (const socket of sockets) {
          io.to(socket.socket).emit("FE_receive_accepted_friend_request", {
            friends: friend.friends,
          });
        }
        let socketUser = await User.findOneAndUpdate(
          {
            _id: socket.userId,
          },
          {
            $push: {
              friends: {
                info: friendId,
              },
            },
            $pull: {
              friendRequestNotifications: {
                _id: notificationId,
              },
            },
          },
          { new: true },
        );
        const userSockets = socketUser.sockets;
        // cap nhat ban va cap nhan thong bao
        for (const socket of userSockets) {
          io.to(socket.socket).emit("FE_accept_friend_request_succeeded", {
            friends: socketUser.friends,
            notifications: socketUser.friendRequestNotifications,
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    },
  );
  socket.on("BE_refuse_friend_request", async ({ notificationId }) => {
    try {
      let socketUser = await User.findOneAndUpdate(
        {
          _id: socket.userId,
        },
        {
          $pull: {
            friendRequestNotifications: {
              _id: notificationId,
            },
          },
        },
        { new: true },
      );
      const userSockets = socketUser.sockets;
      // cap nhat thong bao
      for (const socket of userSockets) {
        io.to(socket.socket).emit("FE_refuse_friend_request_succeeded", {
          notifications: socketUser.friendRequestNotifications,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};
