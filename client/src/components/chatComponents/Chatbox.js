import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  getOldMessages,
  pushMessages,
  resetMessage,
} from "../../slice/roomSlice";
import { socket } from "../../socket";
import _ from "lodash";
import { updateFriend } from "../../slice/userSlice";
import ChatBuble from "./ChatBuble";
import { FaTelegramPlane } from "react-icons/fa";
function Chatbox(props) {
  const user = useSelector((state) => state.user);
  const room = useSelector((state) => state.room);
  const inputRef = useRef();
  const scrollToView = useRef();
  const dispatch = useDispatch();
  const [pageCount, setPageCount] = useState(0);
  const [firstTime, setFirstTime] = useState(true);
  const observer = useRef();
  const lastDivElement = useCallback(
    (node) => {
      if (room.currentRoom) {
        if (observer.current) {
          observer.current.disconnect();
        }
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && pageCount > 0) {
            if (room.messages.length > 20 * (pageCount - 1)) {
              socket.emit("BE_get_messages", {
                roomId: room.currentRoom,
                pageCount,
                additionElements: room.messages.length % 20,
              });
            } else {
              socket.emit("BE_get_messages", {
                roomId: room.currentRoom,
                pageCount,
              });
            }
          }
        });
        if (node) {
          observer.current.observe(node);
        }
      }
    },
    [pageCount, room.messages, room.currentRoom],
  );

  function createSocketEventHandleForChat(socket) {
    socket.off("FE_to_send_message");
    socket.on("FE_to_send_message", ({ friend, message, roomId }) => {
      if (room.currentRoom === roomId) {
        dispatch(
          updateFriend({
            friend: {
              ...friend,
              unRead: 0,
            },
          }),
        );
        dispatch(
          pushMessages({
            message,
          }),
        );
        socket.emit("BE_seen_messages", { roomId });
      } else {
        dispatch(
          updateFriend({
            friend,
          }),
        );
      }
    });
    socket.off("FE_from_send_message");
    socket.on("FE_from_send_message", ({ friend, message, roomId }) => {
      if (room.currentRoom === roomId) {
        dispatch(
          updateFriend({
            friend,
          }),
        );
        dispatch(
          pushMessages({
            message: message,
          }),
        );
      } else {
        dispatch(
          updateFriend({
            friend,
          }),
        );
      }
    });
    socket.off("FE_seen_messages");
    socket.on("FE_seen_messages", ({ friend }) => {
      dispatch(
        updateFriend({
          friend,
        }),
      );
    });
  }

  useEffect(() => {
    if (socket.connected) {
      createSocketEventHandleForChat(socket);
    } else {
      socket.on("FE_connected", () => {
        createSocketEventHandleForChat(socket);
      });
    }
    dispatch(resetMessage());
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (room.currentRoom) {
      setPageCount(1);
      socket.emit("BE_seen_messages", { roomId: room.currentRoom });
      socket.off("FE_send_messages");
      socket.on("FE_send_messages", ({ messages, pageCountRemain }) => {
        dispatch(getOldMessages({ messages }));
        setPageCount(pageCountRemain);
      });
      setFirstTime(true);
    }
  }, [room.currentRoom]);
  useEffect(() => {
    if (room.messages.length > 0 && firstTime) {
      if (scrollToView && scrollToView.current) {
        scrollToView.current.scrollIntoView();
      }
      setFirstTime(false);
    }
  }, [room.messages]);

  // gui tin nhan
  function sendMessage(e) {
    e.preventDefault();
    if (inputRef.current.value.trim()) {
      socket.emit("BE_send_message", {
        roomId: room.currentRoom,
        message: inputRef.current.value.trim(),
      });
      const ids = room.currentRoom.split("_");
      let toId;
      if (ids[0] === user._id) {
        toId = ids[1];
      } else {
        toId = ids[0];
      }
      let friend = _.find(user.friends, {
        info: { _id: toId },
      });
      dispatch(
        pushMessages({
          message: {
            _id: uuidv4(),
            roomId: room.currentRoom,
            body: inputRef.current.value.trim(),
            from: _.pick(user, ["_id", "avatar", "userName"]),
            to: friend,
            createAt: _.now(),
          },
        }),
      );
      dispatch(
        updateFriend({
          friend: {
            ...friend,
            message: inputRef.current.value.trim(),
            lastTimeCommunicate: _.now(),
          },
        }),
      );
      inputRef.current.value = "";
      setFirstTime(true);
    }
  }

  return (
    <>
      {room.currentRoom && (
        <div className="grow h-full overflow-auto w-[70%] bg-white flex gap-4 flex-col justify-between">
          <div
            className={`h-[calc(100%-50px)] p-3 overflow-auto custom_scrollbar flex
             first:mt-0 flex-col-reverse gap-6 relative`}
          >
            <div ref={scrollToView} className="mt-[-1.5rem]"></div>
            {room.messages.map((message) => {
              return (
                <ChatBuble message={message} user={user} key={message._id} />
              );
            })}
            <div ref={lastDivElement}></div>
          </div>
          <form
            className="flex justify-between gap-4 p-3"
            onSubmit={sendMessage}
          >
            <label htmlFor="chat_form" hidden={true}></label>
            <textarea
              name="text"
              id="chat_form"
              className="resize-none h-[50px] bg-slate-200 bg-opacity-75 rounded-3xl grow focus:outline-none px-4 py-3"
              autoComplete="off"
              ref={inputRef}
            />
            <button
              type="submit"
              className="focus:outline-none px-3 py-3 rounded-full
              hover:bg-slate-200 bg-opacity-75"
              title="Gửi"
            >
              <FaTelegramPlane className="text-xl text-blue-600" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
export default Chatbox;
