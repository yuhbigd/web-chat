import React, { useEffect, useState } from "react";
import Sidebar from "../components/chatComponents/Sidebar";

import Chatbox from "../components/chatComponents/Chatbox";
function Chat(props) {
  // const [height, setHeight] = useState(0);
  // useEffect(() => {
  //   setHeight(props.getNavHeight());
  // }, []);
  return (
    <div
      className={`grow ${`h-[calc(100vh-60px)]`} w-screen bg-slate-200 flex gap-4`}
    >
      <Sidebar />
      <Chatbox />
    </div>
  );
}

export default Chat;
