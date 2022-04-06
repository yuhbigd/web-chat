import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import landingPic from "../assets/images/image_processing20210120-16343-z9u17a.jpg";
function Landing() {
  const user = useSelector((state) => state.user);
  let navigate = useNavigate();
  return (
    <div
      className="grow h-full grid grid-cols-12 m-5 gap-5 
    sm:grid sm:grid-cols-1 sm:grid-rows-2 grid-flow-col"
    >
      <div
        className="col-start-1 col-span-4 flex flex-col justify-center gap-14
      sm:col-auto sm:items-center"
      >
        <h1
          className="text-7xl font-semibold text-blue-800 
        lg:text-6xl
        md:text-5xl"
        >
          Chattup
        </h1>
        <h3
          className="text-5xl font-light 
        lg:text-4xl
        md:text-3xl"
        >
          Nơi kết nối tất cả mọi người
        </h3>
        <button
          className="text-4xl font-normal bg-blue-800 text-slate-50 px-10 py-4 rounded-full
         lg:text-3xl lg:px-8 lg:py-2
         md:text-2xl md:px-6 md:py-2
         hover:bg-blue-900"
          onClick={() => {
            if (user && user.userName) {
              navigate("/chat", { replace: true });
            } else {
              navigate("/login", { replace: true });
            }
          }}
        >
          Bắt đầu ngay
        </button>
      </div>
      <div
        className="col-start-5 col-span-8 
      sm:col-auto"
      >
        <img
          src={landingPic}
          alt="landing image"
          className="object-contain w-full h-[full]"
        />
      </div>
    </div>
  );
}

export default Landing;
