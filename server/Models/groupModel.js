const mongoose = require("mongoose");
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter a name for the group"],
    validate: [
      (name) => {
        let cName = name;
        cName.trim();
        return cName.length > 0;
      },
      "This name is inappropriate",
    ],
  },
  image: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPQ53Esibh-O6ebk0B4OBfulUoQDlQBUPQ3Q&usqp=CAU",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
  ],
});
const Group = mongoose.model("groups", groupSchema);

module.exports = Group;
