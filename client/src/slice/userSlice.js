import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
  localStorage.clear();
  return {};
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getUserFromLocal(state, action) {
      let user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        state = user;
        return state;
      }
      return {};
    },
    resetUser(state, action) {
      return {};
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state, action) => {
        return "pending";
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
      .addCase(postSignup.pending, (state, action) => {
        return "pending";
      })
      .addCase(postSignup.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(postSignup.rejected, (state, action) => {
        socket.disconnect();
        socket.connect();
        return { error: action.error.message };
      })
      .addCase(logout.fulfilled, (state, action) => {
        socket.disconnect();
        return action.payload;
      });
  },
});
export const { getUserFromLocal, resetUser } = userSlice.actions;

export default userSlice.reducer;
