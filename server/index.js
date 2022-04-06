const express = require("express");
const cookie_Parse = require("cookie-parser");
const cookie = require("cookie");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const authRouter = require("./Routes/authRouters");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("./Firebase/firebase.config");
global.fetch = fetch;
const _ = require("lodash");
const cors = require("cors");
const { checkUser } = require("./middlewares/AuthMiddleware/checkUser");
const clientRegisterHandler = require("./SocketHandler/clientRegisterHandler");
const User = require("./models/userModel");
const chatWithFriendHandler = require("./SocketHandler/chatWithFriendHandler");
global._ = _;

require("dotenv").config();

require("./Firebase/firebase.config");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cookie_Parse());

mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    return result;
  })
  .catch((err) => console.log(err));

// enable cors for localhost

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/", authRouter.router);
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: corsOptions,
});
io.use(async (socket, next) => {
  if (socket.handshake.headers.cookie) {
    let { token } = cookie.parse(socket.handshake.headers.cookie);
    if (token) {
      const { user } = await jwt.verify(token, process.env.SECRET_KEY);
      if (user) {
        let isUser = await User.findOne({ _id: user._id });
        if (isUser) {
          socket.userId = user._id;
          next();
        }
      }
    }
  }
});
io.on("connection", (socket) => {
  clientRegisterHandler(io, socket).then(() => {
    chatWithFriendHandler(io, socket);
  });
});
server.listen(4000, () => {
  console.log("server is listen on port 3001");
});
