const jwt = require("jsonwebtoken");
const { createToken } = require("../../RouterController/authController");
const User = require("../../models/userModel");
require("dotenv").config();

//checking Token, if it's true then next else checking refresh Token
const checkUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const { user } = await jwt.verify(token, process.env.SECRET_KEY);
      if (user) {
        req.user = await User.findOne({ _id: user._id }).populate(
          "friends.info",
          "_id avatar userName",
        );
        next();
      } else {
        res.clearCookie("token", {
          // secure: true,
          // sameSite: "none",
        });
        res.status(401).json({
          error: "invalid token",
        });
      }
    } catch (err) {
      res.status(400).json({
        error: err.message,
      });
    }
  } else {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const newToken = await getNewToken(refreshToken);
      if (newToken.token && newToken.refreshToken) {
        res.cookie("token", newToken.token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
          // secure: true,
          // sameSite: "none",
        });
        res.cookie("refreshToken", newToken.refreshToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
          // secure: true,
          // sameSite: "none",
        });
        req.user = newToken.user;
        next();
      } else {
        res.clearCookie("refreshToken", {
          // secure: true,
          // sameSite: "none"
        });
        res.status(401).json({
          error: "invalid refreshToken",
        });
      }
    } else {
      res.status(401).json({
        error: "You don't have authorization to view this content",
      });
    }
  }
};

// checking refreshToken, if it is true, creating new Token and refresh Token
async function getNewToken(refreshToken) {
  let userId = -1;
  try {
    const {
      user: { _id },
    } = jwt.decode(refreshToken);
    userId = _id;
  } catch (error) {
    return {};
  }

  if (!userId) {
    return {};
  }

  const user = await User.findOne({ _id: userId }).populate(
    "friends.info",
    "_id avatar userName",
  );

  if (!user) {
    return {};
  }

  const refreshKey = process.env.SECRET_REFRESH_KEY + user.password;

  try {
    jwt.verify(refreshToken, refreshKey);
  } catch (error) {
    return {};
  }
  const newToken = await createToken(user);
  return {
    token: newToken.token,
    refreshToken: newToken.refreshToken,
    user: user,
  };
}

module.exports = { checkUser };
