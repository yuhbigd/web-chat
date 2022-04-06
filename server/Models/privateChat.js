const mongoose = require("mongoose");
const privateChatSchema = new mongoose.Schema({
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
    default: Date.now,
  },
});
const privateChat = mongoose.model("groupChats", privateChatSchema);

module.exports = privateChat;
