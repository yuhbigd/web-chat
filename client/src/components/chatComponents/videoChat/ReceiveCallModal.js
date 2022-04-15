import { Howl } from "howler";
import React, { useEffect, useRef } from "react";
import soundAd from "../../../assets/sound/mixkit-fairy-message-notification-861.wav";
function ReceiveCallModal(props) {
  const sound = useRef(
    new Howl({
      src: [soundAd],
      html5: true,
      loop: true,
    }),
  );
  useEffect(() => {
    if (sound.current) {
      sound.current.play();
    }
    return () => {
      if (sound.current) {
        sound.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-slate-300 bg-opacity-50 z-[99] flex justify-center items-center">
      <div className="w-[35%] bg-slate-50 rounded-lg flex flex-col justify-around items-center gap-4 p-3">
        <img
          src={props.caller.info.avatar}
          className="w-20 h-20 sm:w-15 sm:h-15 object-cover rounded-full"
        ></img>
        <p>{props.caller.info.userName} đang gọi cho bạn</p>
        <div className="flex gap-4">
          <button
            onClick={props.yes}
            className="p-2 rounded-lg bg-sky-300 hover:bg-sky-500 text-white font-medium"
          >
            Chấp nhận
          </button>
          <button
            onClick={props.no}
            className="p-2 rounded-lg bg-red-300 hover:bg-red-500 text-white font-medium"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiveCallModal;
