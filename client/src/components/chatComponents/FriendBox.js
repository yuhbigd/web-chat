import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoom } from "../../slice/roomSlice";
import { socket } from "../../socket";

function FriendBox(props) {
  const room = useSelector((state) => state.room);
  const dispatch = useDispatch();
  const [roomId, setRoomId] = useState(createRoomId());
  function createRoomId() {
    let order = props.user._id.localeCompare(props.friend.info._id);
    let roomId;
    if (order < 0) {
      roomId = props.friend.info._id + "_" + props.user._id;
    } else {
      roomId = props.user._id + "_" + props.friend.info._id;
    }
    return roomId;
  }

  useEffect(() => {
    function joinRoom() {
      socket.emit("BE_join_room", roomId);
    }
    socket.off("FE_connected", joinRoom);
    socket.on("FE_connected", joinRoom);
    if (socket.connected) {
      joinRoom();
    }
    return () => {
      socket.off("FE_connected", joinRoom);
      dispatch(setCurrentRoom({}));
    };
  }, []);

  return (
    <li
      className={`flex min-h-[4rem] rounded-lg p-3 ${
        room.currentRoom === roomId
          ? "bg-slate-300 bg-opacity-50"
          : "hover:bg-slate-300"
      }`}
      key={props.friend.info._id}
      onClick={(e) => {
        e.preventDefault();
        dispatch(setCurrentRoom({ room: roomId }));
      }}
    >
      <img
        src={props.friend.info.avatar}
        title="avatar"
        className="w-10 h-10 rounded-full object-cover my-auto"
      ></img>
      <div className="relative grow ml-4">
        <h3 className="font-semibold friend_box_truncate">
          {props.friend.info.userName}
        </h3>
        <p
          className={`friend_box_truncate ${
            props.friend.unRead > 0 ? "" : "opacity-60"
          }`}
        >
          {props.friend.message}
        </p>
        <small
          hidden={props.friend.unRead <= 0}
          className="absolute top-[50%] left-full translate-y-[-50%] translate-x-[-100%] bg-red-500 
        w-6 h-6 leading-6 text-center rounded-full text-white font-medium"
        >
          {props.friend.unRead < 9 ? props.friend.unRead : "9+"}
        </small>
      </div>
    </li>
  );
}

export default React.memo(FriendBox);
