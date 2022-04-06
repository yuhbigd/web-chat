const mongoose = require("mongoose");
const groupChatSchema = new mongoose.Schema({
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
  in: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "groups",
    index: true,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
const groupChats = mongoose.model("groupChats", groupSchema);

module.exports = groupChats;
