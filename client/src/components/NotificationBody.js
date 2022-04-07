import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateFriends, updateNotifications } from "../slice/userSlice";
import { socket } from "../socket";

function NotificationBody(props) {
  let notification = props.notification;
  const dispatch = useDispatch();
  useEffect(() => {
    socket.on("FE_receive_accepted_friend_request", ({ friends }) => {
      dispatch(updateFriends({ friends }));
    });
    socket.on(
      "FE_accept_friend_request_succeeded",
      ({ friends, notifications }) => {
        dispatch(updateFriends({ friends }));
        dispatch(updateNotifications({ notifications }));
      },
    );
    socket.on("FE_refuse_friend_request_succeeded", ({ notifications }) => {
      dispatch(updateNotifications({ notifications }));
    });
  }, []);

  function acceptHandle(e) {
    e.preventDefault();
    socket.emit("BE_accept_friend_request", {
      friendId: notification.friendId,
      notificationId: notification._id,
    });
  }
  function refuseHandle(e) {
    e.preventDefault();
    socket.emit("BE_refuse_friend_request", {
      notificationId: notification._id,
    });
  }
  return (
    <li
      key={notification._id}
      className="flex gap-4 items-center p-2 rounded-xl hover:bg-gray-100"
    >
      <img
        src={notification.avatar}
        className="h-10 object-cover rounded-full"
      />
      <div className="grow">
        <div className="flex flex-col items-left">
          <h3 className="text-xl font-semibold sm:text-lg">
            {notification.userName}
          </h3>
          <small className="text-xs font-light">
            {moment(notification.timestamp).format("MM/DD/YYYY HH:mm")}
          </small>
        </div>
        <p className="font-light notification_body_truncate sm:text-sm">
          {notification.message}
        </p>
        <div className="flex gap-8 mt-4">
          <button
            className="text-white font-medium px-3 py-1 rounded-xl bg-blue-500
             sm:text-sm sm:px-2 sm:py-1"
            onClick={acceptHandle}
          >
            Chấp nhận
          </button>
          <button
            className="font-medium px-3 py-1 rounded-xl bg-slate-300
             sm:text-sm sm:px-2 sm:py-1"
            onClick={refuseHandle}
          >
            Từ chối
          </button>
        </div>
      </div>
    </li>
  );
}

export default NotificationBody;
