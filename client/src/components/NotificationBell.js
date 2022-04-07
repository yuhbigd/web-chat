import React, { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";
import NotificationContainer from "./NotificationContainer";
import { updateNotifications } from "../slice/userSlice";
function NotificationBell(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    socket.on("FE_receive_friend_request", (friendRequestNotifications) => {
      dispatch(
        updateNotifications({
          notifications: friendRequestNotifications.notifications,
        }),
      );
    });
  }, []);

  const user = useSelector((state) => state.user);
  const [hideBody, setHideBody] = useState(true);
  let friendRequestNotifications = [];
  if (
    user.friendRequestNotifications &&
    user.friendRequestNotifications.length > 0
  ) {
    friendRequestNotifications = user.friendRequestNotifications;
  }
  useEffect(() => {
    if (
      user.friendRequestNotifications &&
      user.friendRequestNotifications.length < 1
    ) {
      setHideBody(true);
    }
  }, [user]);

  return (
    <div className={props.className + " relative"}>
      <FaUserFriends
        className="w-6 h-6 hover:cursor-pointer"
        title={"Thông báo kết bạn"}
        onClick={(e) => {
          setHideBody(!hideBody);
        }}
      />
      {friendRequestNotifications.length > 0 && (
        <div className="absolute border border-slate-50 bg-red-500 rounded-full w-5 h-5 flex justify-center items-center top-full left-full translate-y-[-50%]">
          <small className="font-semibold text-slate-50">
            {friendRequestNotifications.length < 10
              ? friendRequestNotifications.length
              : "9+"}
          </small>
        </div>
      )}
      {!hideBody && (
        <NotificationContainer
          className="absolute top-full w-[25vw] sm:w-[50vw] max-h-[50vh] min-h-[50px]
          overflow-auto shadow-lg right-[50%] translate-y-6 custom_scrollbar p-2 rounded-xl bg-white"
        />
      )}
    </div>
  );
}

export default NotificationBell;
