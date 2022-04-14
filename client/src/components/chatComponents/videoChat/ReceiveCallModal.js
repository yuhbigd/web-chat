import React from "react";

function ReceiveCallModal(props) {
  return (
    <div className="fixed w-[100vw] h-[100vh] bg-slate-300 bg-opacity-50 z-[99] flex justify-center items-center">
      <div>
        <p>{props.caller.info.userName}</p>
      </div>
      <div>
        <button onClick={props.yes}>yes</button>
        <button onClick={props.no}>no</button>
      </div>
    </div>
  );
}

export default ReceiveCallModal;
