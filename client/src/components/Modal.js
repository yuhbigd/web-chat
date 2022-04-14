import React from "react";
import { ImWarning } from "react-icons/im";
function Modal(props) {
  return (
    <div
      className="fixed w-[100vw] h-[100vh] bg-slate-300 bg-opacity-50 z-[99] flex justify-center items-center"
      onClick={props.hide}
    >
      <div
        className="w-[35%] h-[35%] bg-white flex flex-col items-center justify-between p-4 gap-5 rounded-2xl
      md:w-[50%] md:h-[50%]"
      >
        <ImWarning className="text-slate-500 text-5xl" />
        <p className="text_truncate text-center overflow-auto">
          {props.message}
        </p>
        <button
          className="rounded-lg bg-blue-500 text-white p-2 font-medium"
          onClick={props.hide}
        >
          Chấp nhận
        </button>
      </div>
    </div>
  );
}

export default Modal;
