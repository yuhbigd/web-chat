const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sanitize = require("mongo-sanitize");
require("dotenv").config();

createToken = async function (user) {
  const token = await jwt.sign(
    {
      user: _.pick(user, ["_id"]),
    },
    process.env.SECRET_KEY,
    {
      expiresIn: 1000 * 60 * 60 * 24,
    },
  );
  const refreshToken = await jwt.sign(
    {
      user: _.pick(user, "_id"),
    },
    process.env.SECRET_REFRESH_KEY + user.password,
    {
      expiresIn: 1000 * 60 * 60 * 24 * 7,
    },
  );
  return { token, refreshToken };
};

// getting data when client go to the website
login_get = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: _.pick(user, [
        "_id",
        "email",
        "userName",
        "sockets",
        "avatar",
        "messageWithGroup",
        "messageWithFriend",
        "friends",
        "groups",
        "friendRequestNotifications",
      ]),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//sign-up controller
signup_post = async (req, res) => {
  try {
    const { email, password, userName, avatar } = req.body;
    const user = await User.create({
      email,
      password,
      userName,
      avatar,
    });
    const { token, refreshToken } = await createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      // secure: true,
      // sameSite: "none",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      // secure: true,
      // sameSite: "none",
    });
    res.status(201).json({
      user: _.pick(user, [
        "_id",
        "email",
        "userName",
        "sockets",
        "avatar",
        "messageWithGroup",
        "messageWithFriend",
        "friends",
        "groups",
        "friendRequestNotifications",
      ]),
    });
  } catch (error) {
    if (error.code) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ error: "This email has been used by another person" });
        return;
      }
    }
    res.status(400).json({ error: error.message });
  }
};

// login controller
login_post = async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await User.login(email, password);

    const { token, refreshToken } = await createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      // secure: true,
      // sameSite: "none",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      // secure: true,
      // sameSite: "none",
    });
    res.status(200).json({
      user: _.pick(user, [
        "_id",
        "email",
        "userName",
        "sockets",
        "avatar",
        "messageWithGroup",
        "messageWithFriend",
        "friends",
        "groups",
        "friendRequestNotifications",
      ]),
    });
  } catch (error) {
    res.clearCookie("token", {
      // secure: true,
      // sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      // secure: true,
      // sameSite: "none",
    });
    res.status(400).json({ error: error.message });
  }
};

//logout
function logout_get(req, res) {
  res.clearCookie("refreshToken", {
    // secure: true,
    // sameSite: "none",
  });
  res.clearCookie("token", {
    // secure: true,
    // sameSite: "none",
  });
  res.status(200).json({
    message: "Logged out",
  });
}
module.exports = {
  createToken,
  login_post,
  signup_post,
  login_get,
  logout_get,
};
