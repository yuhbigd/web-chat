import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteOldToken } from "../Firebase/firebase";
import { socket } from "../socket";

const initialState = {};
let baseUrl = process.env.REACT_APP_BASE_URL;
export const login = createAsyncThunk("user/login", async (user) => {
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(user),
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } else {
    return Promise.reject(data.error);
  }
});

export const getLogin = createAsyncThunk("user/getLogin", async () => {
  const response = await fetch(`${baseUrl}/login`, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } else {
    localStorage.clear();
    return Promise.reject(data.error);
  }
});

export const postSignup = createAsyncThunk(
  "user/signup",
  async ({ email, password, userName, avatar }) => {
    const response = await fetch(`${baseUrl}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, userName, avatar }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } else {
      return Promise.reject(data.error);
    }
  },
);

export const logout = createAsyncThunk("user/logout", async () => {
  const response = await fetch(`${baseUrl}/logout`, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  await deleteOldToken();
  //delete old service worker
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
  localStorage.clear();
  return {};
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state = JSON.parse(action.payload.user);
      return state;
    },
    resetUser(state, action) {
      return {};
    },
    updateNotifications(state, action) {
      const notifications = action.payload.notifications;
      state.friendRequestNotifications = notifications;
    },
    updateFriends(state, action) {
      const friends = action.payload.friends;
      state.friends = friends;
    },
    updateFriend(state, action) {
      const friendId = action.payload.friend.info._id;
      for (let i = 0; i < state.friends.length; i++) {
        if (state.friends[i].info._id === friendId) {
          state.friends[i] = action.payload.friend;
          break;
        }
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state, action) => {
        return { pending: "pending" };
      })
      .addCase(login.fulfilled, (state, action) => {
        socket.disconnect();
        socket.connect();
        return action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        return { error: action.error.message };
      })
      .addCase(getLogin.fulfilled, (state, acton) => {
        socket.disconnect();
        socket.connect();
        return acton.payload;
      })
      .addCase(getLogin.rejected, (state, action) => {
        return {};
      })
      .addCase(postSignup.pending, (state, action) => {
        return { pending: "pending" };
      })
      .addCase(postSignup.fulfilled, (state, action) => {
        socket.disconnect();
        socket.connect();
        return action.payload;
      })
      .addCase(postSignup.rejected, (state, action) => {
        return { error: action.error.message };
      })
      .addCase(logout.fulfilled, (state, action) => {
        socket.disconnect();
        return action.payload;
      });
  },
});
export const {
  setUser,
  resetUser,
  updateNotifications,
  updateFriends,
  updateFriend,
} = userSlice.actions;

export default userSlice.reducer;
