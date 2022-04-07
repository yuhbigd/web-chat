import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { GrClose } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slice/userSlice";
import NotificationBell from "./NotificationBell";
function Navigation() {
  const [hide, setHide] = useState(true);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  return (
    <nav className="sticky top-0 left-0 bg-white w-full shadow sm:flex sm:justify-between">
      <div className="container m-auto flex justify-between items-center text-gray-700 z-50">
        <Link className="pl-8 py-4 text-xl font-bold" to={"/"}>
          Chattup
        </Link>
        <ul
          className={`flex gap-5 items-center pr-10 font-semibold
        sm:flex-col sm:absolute sm:w-full sm:bg-white sm:pr-0 sm:top-full ${
          hide ? "sm:hidden" : ""
        } sm:mt-1 transition-all duration-250`}
        >
          {!user.userName && (
            <>
              <li className="hover:bg-gray-200 sm:w-full">
                <Link className="block px-6 py-4 sm:text-center" to={"/login"}>
                  Đăng nhập
                </Link>
              </li>
              <li className="hover:bg-gray-200 sm:w-full">
                <Link className="block px-6 py-4 sm:text-center" to={"/signup"}>
                  Đăng ký
                </Link>
              </li>
            </>
          )}
          {user.userName && (
            <>
              <li className="sm:w-full">
                <div className="flex gap-5 items-center justify-center">
                  <img
                    className="object-cover w-12 h-12 rounded-full"
                    src={user.avatar}
                  ></img>
                  <p className="inline w-fit h-fit">{user.userName}</p>
                </div>
              </li>
              <NotificationBell className="sm:hidden"></NotificationBell>
              <li className="hover:bg-gray-200 sm:w-full">
                <Link className="block px-6 py-4 sm:text-center" to={"/chat"}>
                  Trò chuyện
                </Link>
              </li>

              <li className="hover:bg-gray-200 sm:w-full">
                <button
                  className="block w-full px-6 py-4 sm:text-center"
                  onClick={async (e) => {
                    e.preventDefault();
                    await dispatch(logout());
                    window.location.replace("/");
                  }}
                >
                  Đăng xuất
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
      <NotificationBell className="hidden sm:block my-auto mr-8"></NotificationBell>
      <button
        className="hidden sm:block my-auto ml-5"
        onClick={() => {
          setHide(!hide);
        }}
      >
        {hide ? (
          <GiHamburgerMenu className="h-5 w-5 mr-5 " />
        ) : (
          <GrClose className="h-5 w-5 mr-5 " />
        )}
      </button>
    </nav>
  );
}

export default Navigation;
