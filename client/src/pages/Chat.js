import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../socket";

function Chat() {
  let user = useSelector((state) => state.user);
  const [noti, setNoti] = useState(null);
  const [message, setMessage] = useState(null);
  const friendId = useRef();
  useEffect(() => {
    socket.on("FE_receive_friend_request", (from) => {
      console.log(from);
      setNoti(from);
    });
    socket.on("FE_accept_friend_request", (notifi) => {
      console.log(notifi);
      setMessage(notifi);
    });
    return () => {};
  }, []);

  return (
    <div>
      id: {user._id}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (friendId.current.value.trim()) {
            console.log(friendId.current.value);
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
      {noti && (
        <div>
          <p>
            {noti.userName} <small>{noti._id}</small>
          </p>
          <img className="w-10 h-10 rounded-full" src={noti.avatar}></img>
          <button
            onClick={(e) => {
              socket.emit("BE_accept_friend_request", noti._id);
            }}
            className="border ml-2 border-black"
          >
            ok
          </button>
        </div>
      )}
      {message}
    </div>
  );
}

export default Chat;
