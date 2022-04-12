const { getMessaging } = require("firebase-admin/messaging");
const Chat = require("../Models/privateChat");
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
        ).populate("friends.info", "_id avatar userName");
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
        ).populate("friends.info", "_id avatar userName");
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

  //nguoi dung vao phong
  socket.on("BE_join_room", (roomId) => {
    socket.join(roomId);
  });

  //fe da doc tin nhan
  socket.on("BE_seen_messages", async ({ roomId }) => {
    try {
      const ids = roomId.split("_");
      let toId;
      if (ids[0] === socket.userId) {
        toId = ids[1];
      } else {
        toId = ids[0];
      }
      let user = await User.findOneAndUpdate(
        {
          _id: socket.userId,
          "friends.info": toId,
        },
        {
          $set: {
            "friends.$.unRead": 0,
          },
        },
        { new: true },
      )
        .populate("friends.info", "_id avatar userName")
        .select({
          friends: { $elemMatch: { info: toId } },
          sockets: 1,
        });
      for (const socket of user.sockets) {
        io.to(socket.socket).emit("FE_seen_messages", {
          friend: user.friends[0],
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  //fe gui tin nhan
  socket.on("BE_send_message", async ({ roomId, message }) => {
    try {
      const ids = roomId.split("_");
      let toId;
      if (ids[0] === socket.userId) {
        toId = ids[1];
      } else {
        toId = ids[0];
      }
      let now = Date.now();
      let chat = await Chat.create({
        body: message,
        from: socket.userId,
        to: toId,
        createAt: now,
        roomId: roomId,
      });
      let returnMessage = await Chat.findOne({ _id: chat._id })
        .populate("from", "_id avatar userName")
        .populate("to", "_id avatar userName");

      let toUser = await User.findOneAndUpdate(
        {
          _id: toId,
          "friends.info": socket.userId,
        },
        {
          $set: {
            "friends.$.message": message,
            "friends.$.lastTimeCommunicate": Date.now(),
          },
          $inc: {
            "friends.$.unRead": 1,
          },
        },
        { new: true },
      )
        .populate("friends.info", "_id avatar userName")
        .select({
          friends: { $elemMatch: { info: socket.userId } },
          sockets: 1,
          userName: 1,
        });
      for (const socket of toUser.sockets) {
        io.to(socket.socket).emit("FE_to_send_message", {
          friend: toUser.friends[0],
          message: returnMessage,
          roomId,
        });
      }
      let notificationMessage = {
        notification: {
          title: `Từ ${toUser.userName}`,
          body: message,
        },
        topic: toId,
        webpush: {
          fcmOptions: {
            link: "/",
          },
        },
      };
      getMessaging()
        .send(notificationMessage)
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
      let fromUser = await User.findOneAndUpdate(
        {
          _id: socket.userId,
          "friends.info": toId,
        },
        {
          $set: {
            "friends.$.message": message,
            "friends.$.lastTimeCommunicate": Date.now(),
          },
        },
        { new: true },
      )
        .populate("friends.info", "_id avatar userName")
        .select({
          friends: { $elemMatch: { info: toId } },
          sockets: 1,
        });
      for (const fromSocket of fromUser.sockets) {
        // gui cho tat ca cac socket khac cua nguoi gui tru socket hien tai cua nguoi gui
        if (fromSocket.socket !== socket.id) {
          io.to(fromSocket.socket).emit("FE_from_send_message", {
            friend: toUser.friends[0],
            message: chat,
            roomId,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
  //lay tin nhan
  socket.on(
    "BE_get_messages",
    async ({ roomId, pageCount, additionElements = 0 }) => {
      try {
        let skippedMess = (pageCount - 1) * 20 + additionElements;
        const messages = await Chat.find({ roomId })
          .populate("from", "_id avatar userName")
          .populate("to", "_id avatar userName")
          .sort({ createAt: -1 })
          .skip(skippedMess)
          .limit(20);
        let pageCountRemain;
        if (messages.length > 0) {
          pageCountRemain = pageCount + 1;
        } else {
          pageCountRemain = -1;
        }
        socket.emit("FE_send_messages", { messages, pageCountRemain });
      } catch (error) {
        console.log(error);
      }
    },
  );
};
