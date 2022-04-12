const { now } = require("lodash");
const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  body: {
    type: String,
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    index: true,
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    index: true,
    required: true,
  },
  createAt: {
    type: Date,
    default: now(),
  },
});
const Chat = mongoose.model("messages", chatSchema);

module.exports = Chat;
