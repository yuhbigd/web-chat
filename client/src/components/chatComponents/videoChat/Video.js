import React, { useEffect, useRef } from "react";
import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
function Video(props) {
  const ref = useRef();
  const peer = props.peer;
  const userVideoAudio = props.userVideoAudio;
  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on("track", (track, stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <div className="w-full h-full relative flex">
      {!userVideoAudio.video && (
        <div className="absolute top-0 left-0 w-full z-10 h-full bg-black" />
      )}
      <video
        className="border w-full h-full border-black grow object-cover"
        playsInline
        autoPlay
        ref={ref}
      />
      {userVideoAudio.audio ? (
        <BsFillMicFill className="absolute z-10 top-0 left-0 text-xl bg-slate-200 bg-opacity-20 rounded-full" />
      ) : (
        <BsFillMicMuteFill className="absolute z-10 top-0 left-0 text-xl bg-slate-200 bg-opacity-20 rounded-full" />
      )}
    </div>
  );
}

export default Video;
