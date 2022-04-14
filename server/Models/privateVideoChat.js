const mongoose = require("mongoose");
const privateVideoChatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  caller: {
    info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
      required: true,
    },
    audio: Boolean,
    video: Boolean,
  },
  callerSocketId: {
    type: String,
    index: true,
  },
  receiver: {
    info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    audio: Boolean,
    video: Boolean,
  },
  receiverSocketId: { type: String, index: true },
});

const privateVideoChat = mongoose.model(
  "privateVideoChat",
  privateVideoChatSchema,
);

module.exports = privateVideoChat;
