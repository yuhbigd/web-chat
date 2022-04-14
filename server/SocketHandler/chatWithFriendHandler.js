const { getMessaging } = require("firebase-admin/messaging");
const Chat = require("../Models/privateChat");
const privateVideoChat = require("../Models/privateVideoChat");
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
      socket.emit("FE_ERROR", {
        error: error.message,
      });
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
        socket.emit("FE_ERROR", {
          error: error.message,
        });
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
      socket.emit("FE_ERROR", {
        error: error.message,
      });
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
      let receiverId;
      if (ids[0] === socket.userId) {
        receiverId = ids[1];
      } else {
        receiverId = ids[0];
      }
      let user = await User.findOneAndUpdate(
        {
          _id: socket.userId,
          "friends.info": receiverId,
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
          friends: { $elemMatch: { info: receiverId } },
          sockets: 1,
        });
      for (const socket of user.sockets) {
        io.to(socket.socket).emit("FE_seen_messages", {
          friend: user.friends[0],
        });
      }
    } catch (error) {
      socket.emit("FE_ERROR", {
        error: error.message,
      });
    }
  });

  //fe gui tin nhan
  socket.on("BE_send_message", async ({ roomId, message }) => {
    try {
      const ids = roomId.split("_");
      let receiverId;
      if (ids[0] === socket.userId) {
        receiverId = ids[1];
      } else {
        receiverId = ids[0];
      }
      let now = Date.now();
      let chat = await Chat.create({
        body: message,
        from: socket.userId,
        to: receiverId,
        createAt: now,
        roomId: roomId,
      });
      let returnMessage = await Chat.findOne({ _id: chat._id })
        .populate("from", "_id avatar userName")
        .populate("to", "_id avatar userName");

      let toUser = await User.findOneAndUpdate(
        {
          _id: receiverId,
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
        topic: receiverId,
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
          "friends.info": receiverId,
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
          friends: { $elemMatch: { info: receiverId } },
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
      socket.emit("FE_ERROR", {
        error: error.message,
      });
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
        // neu mang chat trong thi co nghia la da het cac thu de lay => tra ve -1
        if (messages.length > 0) {
          pageCountRemain = pageCount + 1;
        } else {
          pageCountRemain = -1;
        }
        socket.emit("FE_send_messages", { messages, pageCountRemain });
      } catch (error) {
        socket.emit("FE_ERROR", {
          error: error.message,
        });
      }
    },
  );

  // phan video chat

  //tao phong
  socket.on("BE_caller_create_room", async ({ roomId }) => {
    try {
      console.log("BE_caller_create_room", socket.userId);
      const ids = roomId.split("_");
      let receiverId;
      if (ids[0] === socket.userId) {
        receiverId = ids[1];
      } else {
        receiverId = ids[0];
      }

      let room = await privateVideoChat.create({
        roomId,
        caller: {
          info: socket.userId,
          audio: true,
          video: true,
        },
        callerSocketId: socket.id,
      });
      console.log(room);
      // gui thong bao co nguoi goi cho nguoi duoc goi
      let receiver = await User.findById(receiverId);
      for (const receiverSocket of receiver.sockets) {
        // gui cho tat ca cac socket khac cua nguoi gui tru socket hien tai cua nguoi gui
        io.to(receiverSocket.socket).emit("FE_invited_to_room", {
          roomId,
          caller: socket.userId,
          callerId: socket.id,
        });
      }
    } catch (error) {
      if (error.code) {
        if (error.code === 11000) {
          socket.emit("FE_ERROR", {
            error: "Bạn đang trò chuyện với người này trên thiết bị khác",
          });
          return;
        }
      } else {
        socket.emit("FE_ERROR", {
          error: error.message,
        });
      }
    }
  });
  // nguoi nhan vao phong
  socket.on("BE_receiver_join_room", async ({ roomId }) => {
    try {
      console.log("BE_receiver_join_room", socket.userId);
      const room = await privateVideoChat.findOne({ roomId });
      if (room) {
        if (room.receiverSocketId) {
          throw new Error(
            "Bạn đã được kết nối vơi người này trên thiết bị khác",
          );
        } else {
          await privateVideoChat.findOneAndUpdate(
            { roomId },
            {
              receiver: {
                info: socket.userId,
                video: true,
                audio: true,
              },
              receiverSocketId: socket.id,
            },
          );
          //xoa thong bao o cac socket !=
          const receiver = await User.findOne({ _id: socket.userId });
          for (const receiverSocket of receiver.sockets) {
            if (receiverSocket.socket !== socket.id) {
              io.to(receiverSocket).emit("FE_stop_chat_video_notifying");
            }
          }
        }
      }
    } catch (error) {
      socket.emit("FE_ERROR", {
        error: error.message,
      });
    }
  });

  // nguoi nhan tu choi vao phong
  socket.on("BE_receiver_refuse_joining", async ({ roomId, callerId }) => {
    try {
      console.log("BE_receiver_refuse_joining");
      io.to(callerId).emit("FE_leave_room");
      // huy phia nguoi nhan
      const receiver = await User.findOne({ _id: socket.userId });
      for (const receiverSocket of receiver.sockets) {
        if (receiverSocket.socket !== socket.id) {
          io.to(receiverSocket.socket).emit("FE_stop_chat_video_notifying", {
            roomId,
          });
        }
      }
    } catch (error) {
      socket.emit("FE_ERROR", {
        error: error.message,
      });
    }
    // //huy phia nguoi goi
    // const room = await privateVideoChat.findOne({ roomId });
    // io.to(room.callerSocketId).emit("FE_leave_room");
  });

  //khi nguoi duoc goi da vao phong thi lay info cua nguoi da o trong phong
  socket.on("BE_video_room_joined", async ({ roomId, userId }) => {
    try {
      let room = await privateVideoChat.findOne({ roomId: roomId });
      if (room.caller.info.toHexString() !== userId) {
        console.log("BE_video_room_joined ");
        socket.emit("FE_the_other_users", {
          caller: room.caller,
          callerSocketId: room.callerSocketId,
        });
      }
    } catch (error) {
      socket.emit("FE_ERROR", {
        error: error.message,
      });
    }
  });

  // gui peer signal den nguoi khac trong phong
  socket.on("BE_receiver_sending_signal", ({ callerSocketId, signal }) => {
    console.log("BE_receiver_sending_signal");

    io.to(callerSocketId).emit("FE_the_other_users_receive_signal", {
      signal,
      receiverSocketId: socket.id,
      receiverInfo: socket.userId,
    });
  });

  //gui signal vua duoc cac nguoi khac tao trong phong den nguoi gui signal(nguoi nhan cuoc goi)
  socket.on(
    "BE_the_other_users_return_signal",
    ({ receiverSocketId, signal }) => {
      console.log("BE_the_other_users_return_signal");
      io.to(receiverSocketId).emit("FE_receive_receive_returned_signal", {
        signal,
        sender: socket.userId,
      });
    },
  );

  socket.on("BE_user_leave_room", () => {
    leaveVideoChatRoomHandle(io, socket);
  });
  socket.on("disconnect", () => {
    leaveVideoChatRoomHandle(io, socket);
  });

  //
};
// user leave room handler
async function leaveVideoChatRoomHandle(io, socket) {
  try {
    let videoChatRoomJoined = await privateVideoChat.find({
      $or: [{ callerSocketId: socket.id }, { receiverSocketId: socket.id }],
    });
    for (let index = 0; index < videoChatRoomJoined.length; index++) {
      const chatRoom = videoChatRoomJoined[index];
      if (chatRoom.callerSocketId === socket.id) {
        if (chatRoom.receiverSocketId) {
          io.to(chatRoom.receiverSocketId).emit("FE_leave_room");
        } else {
          const ids = chatRoom.roomId.split("_");
          let receiverId;
          if (ids[0] === socket.userId) {
            receiverId = ids[1];
          } else {
            receiverId = ids[0];
          }
          const receiver = await User.findOne({ _id: receiverId });
          for (const receiverSocket of receiver.sockets) {
            io.to(receiverSocket.socket).emit("FE_stop_chat_video_notifying", {
              roomId: chatRoom.roomId,
            });
          }
        }
      } else {
        io.to(chatRoom.callerSocketId).emit("FE_leave_room");
      }
    }
    let countDeletedRooms = await privateVideoChat.deleteMany({
      $or: [{ callerSocketId: socket.id }, { receiverSocketId: socket.id }],
    });
  } catch (error) {
    socket.emit("FE_ERROR", {
      error: error.message,
    });
  }
}
