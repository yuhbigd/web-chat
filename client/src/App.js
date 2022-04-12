import React, { useEffect, useRef } from "react";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";
import { useDispatch, useSelector } from "react-redux";
import { getLogin, setUser } from "./slice/userSlice";
import { socket } from "./socket";
import { sendNotiToken } from "./Firebase/firebase";
import { createGlobalState } from "react-use";
function usedToGetNoti() {
  let permission = Notification.permission;
  if (permission === "default") {
    Notification.requestPermission();
  }
  if (permission === "granted") {
    sendNotiToken();
  }
}
function App() {
  const navigationHeight = useRef();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  useEffect(() => {
    let cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      dispatch(setUser({ user: cachedUser }));
      dispatch(getLogin());
    }
    socket.offAny();
    socket.on("FE_connected", () => {
      usedToGetNoti();
    });
  }, []);
  function getNavHeight() {
    return navigationHeight.current.clientHeight;
  }
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen max-w-[1500px] mx-auto my-0 ">
        <Navigation ref={navigationHeight} />
        <Routes>
          <Route
            exact
            path="/"
            element={<Landing getNavHeight={getNavHeight} />}
          ></Route>

          <Route
            path="/login"
            element={
              !user.email ? (
                <Login getNavHeight={getNavHeight} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          ></Route>
          <Route
            path="/signup"
            element={
              !user.email ? (
                <Signup getNavHeight={getNavHeight} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          ></Route>

          <Route
            path="/chat"
            element={<Chat getNavHeight={getNavHeight} />}
          ></Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
