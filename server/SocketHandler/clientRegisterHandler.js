const User = require("../models/userModel");
const { getMessaging } = require("firebase-admin/messaging");
module.exports = async (io, socket) => {
  try {
    await User.updateOne(
      {
        _id: socket.userId,
      },
      {
        $push: {
          sockets: { socket: socket.id },
        },
      },
    );
  } catch (e) {
    console.log(e.message);
  }
  socket.emit("FE_connected");
  socket.on("BE_subscribe_user_topic_noti", (notiToken) => {
    getMessaging()
      .subscribeToTopic([notiToken], socket.userId)
      .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        // console.log("Successfully subscribed to topic:", response);
      })
      .catch((error) => {
        // console.log("Error subscribing to topic:", error);
      });
  });
  socket.on("disconnect", async () => {
    try {
      await User.updateOne(
        {
          _id: socket.userId,
        },
        {
          $pull: { sockets: { socket: socket.id } },
        },
      );
    } catch (e) {
      console.log(e.message);
    }
  });
};
