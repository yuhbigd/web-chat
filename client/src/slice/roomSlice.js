import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  messages: [],
};
const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setCurrentRoom(state, action) {
      state.currentRoom = action.payload.room;
    },
    getOldMessages(state, action) {
      state.messages.push(...action.payload.messages);
    },
    pushMessages(state, action) {
      state.messages.unshift(action.payload.message);
    },
    resetMessage(state, action) {
      state.messages = [];
      return state;
    },
  },
});
export const { setCurrentRoom, getOldMessages, pushMessages, resetMessage } =
  roomSlice.actions;

export default roomSlice.reducer;
