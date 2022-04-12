import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slice/userSlice";
import roomReducer from "./slice/roomSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
  },
});
