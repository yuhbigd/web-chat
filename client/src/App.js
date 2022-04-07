import React, { useEffect, useRef } from "react";
import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";
import { useDispatch, useSelector } from "react-redux";
import { getLogin, getUserFromLocal } from "./slice/userSlice";
import { socket } from "./socket";
import { sendNotiToken } from "./Firebase/firebase";
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
  const dispatch = useDispatch();
  const updateUserFt = useRef(0);
  const user = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(getUserFromLocal());
    socket.on("FE_connected", () => {
      usedToGetNoti();
    });
  }, []);
  useEffect(() => {
    if (updateUserFt.current === 0) {
      updateUserFt.current = updateUserFt.current + 1;
    } else if (updateUserFt.current === 1) {
      if (user.email) {
        dispatch(getLogin());
        updateUserFt.current++;
      }
    }
  }, [user]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen max-w-[1500px] mx-auto my-0">
        <Navigation />
        <Routes>
          <Route exact path="/" element={<Landing />}></Route>

          <Route
            path="/login"
            element={!user.email ? <Login /> : <Navigate to="/" replace />}
          ></Route>
          <Route
            path="/signup"
            element={!user.email ? <Signup /> : <Navigate to="/" replace />}
          ></Route>

          {user.email && (
            <>
              <Route path="/chat" element={<Chat />}></Route>
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
