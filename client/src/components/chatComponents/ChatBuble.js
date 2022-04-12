import React, { useState } from "react";
import moment from "moment";
function ChatBuble(props) {
  const [hideTimestamp, setHideTimestamp] = useState(true);
  function toggleHideTimestamp() {
    setHideTimestamp((pre) => {
      return !pre;
    });
  }
  return (
    <div
      key={props.message._id}
      className={`flex gap-4 ${
        props.user._id === props.message.from._id ? "ml-auto" : ""
      } max-w-[50%] w-fit`}
      onClick={toggleHideTimestamp}
    >
      {props.user._id !== props.message.from._id ? (
        <>
          <img
            src={props.message.from.avatar}
            className="w-6 h-6 rounded-full object-cover"
            title={props.message.from.userName}
          ></img>
          <div
            className="w-full relative"
            title={moment(props.message.createAt).format("HH:mm DD/MM/YYYY")}
          >
            <p className="text_truncate p-2 rounded-lg bg-slate-200">
              {props.message.body}
            </p>
            {hideTimestamp ? null : (
              <small className="absolute left-0 w-24 text-right font-semibold text-xs text-slate-500 text-opacity-75">
                {moment(props.message.createAt).format("HH:mm DD/MM/YYYY")}
              </small>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className="text-left max-w-full  w-fit relative"
            title={moment(props.message.createAt).format("HH:mm DD/MM/YYYY")}
          >
            <p className="text_truncate p-2 rounded-lg bg-blue-500 text-slate-50">
              {props.message.body}
            </p>
            {hideTimestamp ? null : (
              <small className="absolute right-0 w-24 text-right font-semibold text-xs text-slate-500 text-opacity-75">
                {moment(props.message.createAt).format("HH:mm DD/MM/YYYY")}
              </small>
            )}
          </div>
          <img
            src={props.message.from.avatar}
            className="w-6 h-6 rounded-full object-cover"
            title={props.message.from.userName}
          ></img>
        </>
      )}
    </div>
  );
}
// moi lan o ben chatbox thay doi thi lai tao 1 user != user cu => khong the su dung react memo :/
export default ChatBuble;
