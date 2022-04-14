// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useSelector } from "react-redux";
// import Peer from "simple-peer";
// import { socket } from "../../../socket";

// function VideoChatRoom(props) {
//   let roomId = useMemo(props.roomId, []);

//   const user = useSelector((state) => state.user);

//   const [peers, setPeers] = useState([]);
//   const [videoDevices, setVideoDevices] = useState([]);
//   const [userVideoAudio, setUserVideoAudio] = useState({});
//   const userStream = useRef();
//   const myVideoRef = useRef();
//   const peersRef = useEffect([]);

//   useEffect(() => {
//     (async () => {
//       socket.off("FE_leave_room");
//       socket.on("FE_leave_room", () => {
//         props.goBack();
//       });
//       //lay tat ca cac thiet bi ghi hinh tren may tinh
//       let devices = await navigator.mediaDevices.enumerateDevices();
//       const filtered = devices.filter((device) => device.kind === "videoinput");
//       setVideoDevices(filtered);
//       let stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       userStream.current = stream;
//       myVideoRef.current.srcObject = stream;
//       setUserVideoAudio((pre) => {
//         return {
//           ...pre,
//           [user._id]: {
//             video: true,
//             audio: true,
//           },
//         };
//       });

//       socket.emit("BE_video_room_joined", { roomId, userId: user._id });
//       socket.on("FE_the_other_users", ({ caller, callerSocketId }) => {
//         const peer = createPeer(callerSocketId, userStream.current);
//         peersRef.current.push({
//           peerId: caller.info,
//           peer: peer,
//         });
//         let peers = [];
//         peers.push(peer);
//         setPeers(peers);
//         setUserVideoAudio((preList) => {
//           return {
//             ...preList,
//             [caller.info]: { video: caller.video, audio: caller.audio },
//           };
//         });
//       });

//       socket.on(
//         "FE_the_other_users_receive_signal",
//         (signal, receiverSocketId, receiverInfo) => {
//           const peer = addPeer(signal, userStream.current, receiverSocketId); 
//         },
//       );
//     })();
//     return () => {
//       let userVideoTracks = userStream.current.getVideoTracks();
//       userVideoTracks.forEach((track) => {
//         track.stop();
//       });
//       let userAudioTracks = userStream.current.getAudioTracks();
//       userAudioTracks.forEach((track) => {
//         track.stop();
//       });
//       socket.off("FE_leave_room");
//       socket.emit("BE_user_leave_room");
//     };
//   }, []);

//   //tao peer va tao ra signal dau r gui den server de server phan hoi lai cho nguoi != ben trong phong
//   function createPeer(callerSocketId, stream) {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on("signal", (signal) => {
//       socket.emit("BE_receiver_sending_signal", { callerSocketId, signal });
//     });

//     return peer;
//   }

//   function addPeer({ signal, stream, receiverSocketId }) {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//     });
//     peer.on("signal", (signal) => {
//       socket.emit("BE_the_other_users_return_signal", {
//         receiverSocketId,
//         signal,
//       });
//     });
//     peer.signal(signal);
//     return peer;
//   }
//   return (
//     <div className="fixed w-[100vw] h-[100vh] bg-slate-300 z-[50] flex justify-between items-center">
//       <video ref={myVideoRef} muted={true} autoPlay={true} playsInline={true} />
//       <button
//         onClick={() => {
//           props.goBack();
//         }}
//       >
//         Back
//       </button>
//     </div>
//   );
// }

// export default VideoChatRoom;
