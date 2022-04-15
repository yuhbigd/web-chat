import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../socket";
import FriendBox from "./FriendBox";
import { FaUserPlus } from "react-icons/fa";
function Sidebar() {
  const friendId = useRef();
  const user = useSelector((state) => state.user);
  const [friends, setFriends] = useState([]);
  const [hideAddFriend, setHideAddFriend] = useState(true);
  useEffect(() => {
    if (user.friends) {
      setFriends(
        [...user.friends].sort((a, b) => {
          return (
            new Date(b.lastTimeCommunicate) - new Date(a.lastTimeCommunicate)
          );
        }),
      );
    }
  }, [user.friends]);
  function addFriend(e) {
    e.preventDefault();
    if (friendId.current.value.trim()) {
      socket.emit("BE_notify_friend", {
        friendId: friendId.current.value.trim(),
        userName: user.userName,
        _id: user._id,
        avatar: user.avatar,
      });
    }
  }
  return (
    <ul className="bg-white w-[30%] overflow-auto custom_scrollbar flex gap-4 flex-col p-3 z-30 ">
      <li className="relative">
        <button
          onClick={() => {
            setHideAddFriend(!hideAddFriend);
          }}
          title={"thêm bạn"}
          className="text-2xl hover:bg-slate-200 hover:bg-opacity-75 ml-3 p-3 rounded-full"
        >
          <FaUserPlus />
        </button>

        {!hideAddFriend && (
          <div
            className=" flex flex-col gap-2 rounded-xl ml-3 z-30 
          lg:fixed lg:top-[65px] lg:translate-x-[16%] lg:drop-shadow-xl lg:bg-white lg:p-4 lg:max-w-[50%]"
          >
            <p className="text_truncate">
              id của bạn: <span className="font-bold">{user._id}</span>
            </p>
            <form
              onSubmit={addFriend}
              className="flex grow lg:flex-col lg:items-center lg:gap-4"
            >
              <label htmlFor="add_friend" hidden={true}></label>
              <input
                type="text"
                name="add_friend"
                id="add_friend"
                ref={friendId}
                placeholder="Id của người khác"
                className="grow max-w-full px-2 border border-black rounded-xl"
                autoComplete="off"
              />
              <button
                type="submit"
                title={"thêm bạn"}
                className="hover:bg-slate-200 hover:bg-opacity-75 rounded-xl p-1 ml-2"
              >
                Thêm
              </button>
            </form>
          </div>
        )}
      </li>
      {friends.map((friend) => {
        return <FriendBox key={friend.info._id} friend={friend} user={user} />;
      })}
    </ul>
  );
}

export default Sidebar;
