import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_BASE_URL;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});
