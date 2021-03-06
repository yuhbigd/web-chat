import React from "react";
import { useSelector } from "react-redux";
import NotificationBody from "./NotificationBody";

function NotificationContainer(props) {
  const user = useSelector((state) => state.user);
  let friendRequestNotifications = [];

  if (user.friendRequestNotifications) {
    friendRequestNotifications = [...user.friendRequestNotifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }
  // thieu key o day
  return (
    <ul className={props.className}>
      {friendRequestNotifications.map((notification) => {
        return (
          <NotificationBody
            key={notification._id}
            notification={notification}
          />
        );
      })}
    </ul>
  );
}

export default NotificationContainer;
