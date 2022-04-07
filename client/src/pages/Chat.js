import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../socket";

function Chat() {
  let user = useSelector((state) => state.user);
  const friendId = useRef();

  return (
    <div>
      id: {user._id}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (friendId.current.value.trim()) {
            socket.emit("BE_notify_friend", {
              friendId: friendId.current.value.trim(),
              userName: user.userName,
              _id: user._id,
              avatar: user.avatar,
            });
          }
        }}
      >
        <label htmlFor="addFriend">ket ban</label>
        <input
          type="text"
          name="addFriend"
          id="addFriend"
          className="border border-black"
          ref={friendId}
        />
        <button type="submit" className="border ml-2 border-black">
          them
        </button>
      </form>
    </div>
  );
}

export default Chat;
