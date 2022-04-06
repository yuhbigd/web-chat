import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import loginPic from "../assets/images/8e4eeb53eb1ca7fd9b2521420f6f1f40.png";
import { resetUser, login } from "../slice/userSlice";
function Login() {
  const email = useRef("");
  const password = useRef("");
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigate();

  //reset user to null
  useEffect(() => {
    dispatch(resetUser());
  }, []);

  useEffect(() => {
    if (user.userName) {
      navigation("/");
    }
  }, [user]);
  return (
    <div className="grow grid grid-cols-12 m-5 gap-5 grid-flow-col">
      <div
        className="col-start-1 col-span-4 flex flex-col justify-center gap-14
      sm:col-span-12 sm:items-center"
      >
        <h1
          className="text-4xl font-semibold text-blue-800
        lg:text-3xl
        md:text-2xl
        transition-all
        duration-75"
        >
          Đăng nhập vào Chattup
        </h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await dispatch(
              login({
                email: email.current.value,
                password: password.current.value,
              }),
            );
          }}
          className="flex flex-col gap-5 w-full"
        >
          <label htmlFor="email" className="font-bold text-slate-600">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="abc@xxx.com"
            className="border border-slate-500 px-3 py-2 rounded-md 
            focus:outline-none
            focus:border-transparent
            focus:shadow-[0px_0px_1px_3px_rgb(56,189,258)] "
            ref={email}
          />
          <label htmlFor="password" className="font-bold text-slate-600">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="border border-slate-500 px-3 py-2 rounded-md 
            focus:outline-none
            focus:border-transparent
            focus:shadow-[0px_0px_1px_3px_rgb(56,189,258)]"
            ref={password}
          />
          {user.error ? (
            <small className="text-red-600 text-center">{user.error}</small>
          ) : null}
          <button
            type="submit"
            className="w-[55%] bg-sky-700 block mx-auto px-3 py-3 rounded-md text-lg font-medium text-white
            hover:bg-sky-900
            md:w-full
            transition-all
            duration-75
            shadow-sm
            disabled:bg-slate-500 
            disabled:hover:bg-slate-500"
            disabled={user === "pending" ? true : false}
          >
            {user === "pending" ? (
              <svg
                role="status"
                className="mx-auto w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
        <p>
          Hoặc tạo tài khoản mới{" "}
          <Link to={"/signup"} className="text-sky-500 font-bold">
            tại đây
          </Link>
        </p>
      </div>
      <div
        className="col-start-5 col-span-8
      sm:hidden sm:col-auto"
      >
        <img
          src={loginPic}
          alt="landing image"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

export default Login;
