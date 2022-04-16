import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Peer from "simple-peer";
import { socket } from "../../../socket";
import { IoMdExit } from "react-icons/io";
import {
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
  BsFillMicFill,
  BsFillMicMuteFill,
} from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa";
import { MdCameraswitch } from "react-icons/md";
import Video from "./Video";
function VideoChatRoom(props) {
  let roomId = props.roomId;

  const user = useSelector((state) => state.user);

  const [peers, setPeers] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({});
  const userStream = useRef();
  const myVideoRef = useRef();
  const peersRef = useRef([]);
  const [toggleMic, setToggleMic] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);
  const [hideDeviceChoices, setHideDeviceChoices] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const screenShareTrack = useRef();

  useEffect(() => {
    (async () => {
      socket.on("FE_leave_room", () => {
        props.goBack();
      });
      //lay tat ca cac thiet bi ghi hinh tren may tinh
      let devices = await navigator.mediaDevices.enumerateDevices();
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      userStream.current = stream;
      myVideoRef.current.srcObject = stream;
      setUserVideoAudio((pre) => {
        return {
          ...pre,
          [user._id]: {
            video: true,
            audio: true,
          },
        };
      });

      socket.emit("BE_video_room_joined", { roomId, userId: user._id });
      socket.off("FE_the_other_users");
      socket.on("FE_the_other_users", ({ caller, callerSocketId }) => {
        const peer = createPeer(callerSocketId, userStream.current);
        peer.peerId = caller.info;
        peer.peerSocket = callerSocketId;
        peersRef.current.push({
          peerId: caller.info,
          peer: peer,
          peerSocket: callerSocketId,
        });
        let peers = [];
        peers.push(peer);
        setPeers(peers);
        setUserVideoAudio((preList) => {
          return {
            ...preList,
            [caller.info]: { video: caller.video, audio: caller.audio },
          };
        });
      });
      socket.off("FE_the_other_users_receive_signal");
      socket.on(
        "FE_the_other_users_receive_signal",
        ({ signal, receiverSocketId, receiver }) => {
          const peer = addPeer(signal, userStream.current, receiverSocketId);
          peer.peerId = receiver.info;
          peer.peerSocket = receiverSocketId;
          peersRef.current.push({
            peerId: receiver.info,
            peer: peer,
            peerSocket: receiverSocketId,
          });
          setPeers((user) => [...user, peer]);
          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [receiver.info]: { video: receiver.video, audio: receiver.audio },
            };
          });
        },
      );
      // nhan peer tu nguoi khac va bat dau ket noi
      socket.off("FE_receive_receive_returned_signal");
      socket.on("FE_receive_receive_returned_signal", ({ signal, sender }) => {
        const item = peersRef.current.find((p) => p.peerId === sender);
        item.peer.signal(signal);
      });
      // nhan thong bao tat am thanh
      socket.off("FE_toggle_audio");
      socket.on("FE_toggle_audio", ({ roomId, audio, userId }) => {
        setUserVideoAudio((preList) => {
          return {
            ...preList,
            [userId]: { ...preList[userId], audio: audio },
          };
        });
      });
      socket.off("FE_toggle_video");
      socket.on("FE_toggle_video", ({ roomId, video, userId }) => {
        setUserVideoAudio((preList) => {
          return {
            ...preList,
            [userId]: { ...preList[userId], video: video },
          };
        });
      });
    })();
    return () => {
      let userVideoTracks = userStream.current.getVideoTracks();
      userVideoTracks.forEach((track) => {
        track.stop();
      });
      let userAudioTracks = userStream.current.getAudioTracks();
      userAudioTracks.forEach((track) => {
        track.stop();
      });
      socket.off("FE_leave_room");
      socket.emit("BE_user_leave_room");
    };
  }, []);

  //tao peer va tao ra signal dau r gui den server de server phan hoi lai cho nguoi != ben trong phong
  function createPeer(callerSocketId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE_receiver_sending_signal", {
        roomId: roomId,
        callerSocketId,
        signal,
      });
    });

    return peer;
  }

  // nguoi goi nhan dc signal muon ket noi cua nguoi nhan dc cuoc goi, tao ra peer
  function addPeer(signal, stream, receiverSocketId) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    // gui signal vua dc truyen vao lai cho nguoi nhan
    peer.on("signal", (signal) => {
      socket.emit("BE_the_other_users_return_signal", {
        receiverSocketId,
        signal,
      });
    });
    peer.signal(signal);
    return peer;
  }

  function toggleMicro(e) {
    e.preventDefault();
    const userAudioTrack = userStream.current.getAudioTracks()[0];
    let currentMicState = toggleMic;
    // neu bat thi tat, tat thi bat
    if (userAudioTrack) {
      userAudioTrack.enabled = !currentMicState;
    } else {
      userStream.current.getAudioTracks()[0].enabled = !currentMicState;
    }
    setToggleMic(!currentMicState);
    setUserVideoAudio((preList) => {
      return {
        ...preList,
        [user._id]: { video: toggleVideo, audio: toggleMic },
      };
    });
    let socketsArray = peersRef.current.map((peer) => {
      return peer.peerSocket;
    });
    socket.emit("BE_toggle_audio", {
      roomId,
      audio: !currentMicState,
      toSockets: socketsArray,
    });
  }
  function toggleCamera(e) {
    const video = !toggleVideo;
    const audio = toggleMic;
    if (screenShare) {
      screenShareTrack.current.onended();
      setScreenShare(false);
    }
    if (!video) {
      // tat het tat ca cac video
      let userVideoTracks = myVideoRef.current.srcObject.getVideoTracks();
      userVideoTracks.forEach((track) => {
        track.stop();
      });
    } else {
      //chi lay stream cua video
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          let userVideoTracks = userStream.current.getVideoTracks();
          userVideoTracks.forEach((track) => {
            track.stop();
          });
          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");

          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");
          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);
          peersRef.current.forEach(({ peer }) => {
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current,
            );
          });
          myVideoRef.current.srcObject = userStream.current;
        });
    }
    setToggleVideo(video);
    setUserVideoAudio((preList) => {
      return {
        ...preList,
        [user._id]: { video, audio },
      };
    });
    let socketsArray = peersRef.current.map((peer) => {
      return peer.peerSocket;
    });
    socket.emit("BE_toggle_video", {
      roomId,
      video,
      toSockets: socketsArray,
    });
  }
  // bi ro ri bo nho voi ca khong can thiet cai nay cho lam
  // function toggleScreenShare(e) {
  //   if (!screenShare) {
  //     navigator.mediaDevices
  //       .getDisplayMedia({ cursor: true })
  //       .then((stream) => {
  //         const screenTrack = stream.getTracks()[0];

  //         peersRef.current.forEach(({ peer }) => {
  //           // replaceTrack (oldTrack, newTrack, oldStream);
  //           peer.replaceTrack(
  //             peer.streams[0]
  //               .getTracks()
  //               .find((track) => track.kind === "video"),
  //             screenTrack,
  //             userStream.current,
  //           );
  //         });

  //         // Listen click end
  //         screenTrack.onended = () => {
  //           peersRef.current.forEach(({ peer }) => {
  //             peer.replaceTrack(
  //               screenTrack,
  //               peer.streams[0]
  //                 .getTracks()
  //                 .find((track) => track.kind === "video"),
  //               userStream.current,
  //             );
  //           });
  //           myVideoRef.current.srcObject = userStream.current;
  //           setScreenShare(false);
  //         };

  //         myVideoRef.current.srcObject = stream;
  //         screenShareTrack.current = screenTrack;
  //         setScreenShare(true);
  //       });
  //   } else {
  //     screenShareTrack.current.onended();
  //   }
  // }
  function changeCameraDevice(event) {
    event.preventDefault();
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.value
    ) {
      const deviceId = event.target.dataset.value;
      //chi lay stream cua video
      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: false })
        .then((stream) => {
          let userVideoTracks = userStream.current.getVideoTracks();
          userVideoTracks.forEach((track) => {
            track.stop();
          });
          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");

          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");
          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);
          peersRef.current.forEach(({ peer }) => {
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current,
            );
          });
          myVideoRef.current.srcObject = userStream.current;
          setHideDeviceChoices(true);
        });
    }
  }
  return (
    <div className="absolute w-full h-full z-[50] flex flex-col justify-between">
      <div className="w-full h-full relative bg-slate-300">
        <video
          ref={myVideoRef}
          muted={true}
          autoPlay={true}
          playsInline={true}
          className="border border-black w-[20%] h-auto absolute top-0 right-0 z-20 object-cover"
        />

        {peers.map((peer, index) => {
          return (
            <Video
              key={peer.peerId}
              peer={peer}
              userVideoAudio={userVideoAudio[peer.peerId]}
            />
          );
        })}
      </div>
      <div className="bg-white flex gap-4 p-3 justify-around">
        <div className="relative">
          {!hideDeviceChoices && (
            <ul className="absolute bottom-[105%]">
              {videoDevices.map((device) => {
                return (
                  <li
                    key={device.deviceId}
                    onClick={changeCameraDevice}
                    data-value={device.deviceId}
                    className="bg-slate-200 p-3 hover:cursor-pointer hover:bg-slate-400"
                  >
                    {device.label}
                  </li>
                );
              })}
            </ul>
          )}
          <button
            className="p-3 rounded-xl bg-slate-200 hover:bg-slate-400"
            title="thay đổi camera"
            onClick={() => {
              setHideDeviceChoices(!hideDeviceChoices);
            }}
          >
            <MdCameraswitch />
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={toggleMicro}
            className="p-3 rounded-xl bg-slate-200 hover:bg-slate-400"
            title="bật tắt micro"
          >
            {toggleMic ? <BsFillMicFill /> : <BsFillMicMuteFill />}
          </button>

          <button
            onClick={toggleCamera}
            className="p-3 rounded-xl bg-slate-200 hover:bg-slate-400"
            title="bật tắt camera"
          >
            {toggleVideo ? (
              <BsFillCameraVideoFill />
            ) : (
              <BsFillCameraVideoOffFill />
            )}
          </button>
        </div>
        <button
          onClick={() => {
            props.goBack();
          }}
          className="p-3 rounded-xl bg-slate-200"
          title="rời khỏi phòng"
        >
          <IoMdExit />
        </button>
      </div>
    </div>
  );
}

export default VideoChatRoom;
