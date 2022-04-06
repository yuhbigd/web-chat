import React, { useState, useRef, useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import signupPic from "../assets/images/5595f79f09da8b3623f489350e633c7b.png";
import { resetUser, postSignup } from "../slice/userSlice";
function Signup() {
  const [previewImage, setPreviewImage] = useState(
    "https://scr.vn/wp-content/uploads/2020/07/Avatar-Facebook-tr%E1%BA%AFng.jpg",
  );

  const [image, setImage] = useState(null);
  const [uploadingImagePending, setUploadingImagePending] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const email = useRef(null);
  const userName = useRef(null);
  const password = useRef("");
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
  async function uploadImage(image) {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "jcrhs0u2");
    try {
      setUploadingImagePending(true);
      let res = await fetch(
        "https://api.cloudinary.com/v1_1/dmjuy76km/image/upload",
        {
          method: "POST",
          body: data,
        },
      );
      const urlData = await res.json();
      setUploadingImagePending(false);
      setError(null);
      return urlData.url;
    } catch (err) {
      setUploadingImagePending(false);
      setError(err.message);
    }
    return null;
  }

  return (
    <div className="grow grid grid-cols-12 m-5 gap-5 grid-flow-col">
      <div
        className="col-start-1 col-span-4 flex flex-col justify-center
       items-center gap-5 sm:col-span-12"
      >
        <h1
          className="text-4xl font-semibold text-blue-800
        lg:text-3xl
        md:text-2xl
        sm:text-xl
        transition-all
        duration-75
        text-center"
        >
          Tham gia Chattup ngay hôm nay
        </h1>
        <div className="relative w-fit">
          <label
            htmlFor="image"
            className="bg-white shadow-lg border  rounded-full absolute 
            top-full left-full translate-x-[-100%] translate-y-[-100%]"
            title="Thêm ảnh cá nhân"
          >
            <BiPlus />
          </label>
          <input
            type="file"
            name="image"
            id="image"
            hidden
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              let previewImage = e.target.files[0];
              setImage(previewImage);
              setPreviewImage(URL.createObjectURL(previewImage));
            }}
          />
          <img
            className="w-20 h-20 bg-black rounded-full object-cover border border-slate-800"
            src={previewImage}
          />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (image !== null) {
              let uploadedImage = await uploadImage(image);
              if (uploadedImage !== null) {
                await dispatch(
                  postSignup({
                    userName: userName.current.value,
                    email: email.current.value,
                    password: password.current.value,
                    avatar: uploadedImage,
                  }),
                );
              }
            } else {
              await dispatch(
                postSignup({
                  userName: userName.current.value,
                  email: email.current.value,
                  password: password.current.value,
                  avatar: previewImage,
                }),
              );
            }
          }}
          className="flex flex-col gap-3 w-full"
        >
          <label htmlFor="email" className="font-bold text-slate-600">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="abc@xxx.com"
            className="border border-slate-500 px-2 py-1 rounded-md 
            focus:outline-none
            focus:border-transparent
            focus:shadow-[0px_0px_1px_3px_rgb(56,189,258)]"
            ref={email}
          />
          <label htmlFor="password" className="font-bold text-slate-600">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="border border-slate-500 px-2 py-1 rounded-md 
            focus:outline-none
            focus:border-transparent
            focus:shadow-[0px_0px_1px_3px_rgb(56,189,258)]"
            ref={password}
          />
          <label htmlFor="username" className="font-bold text-slate-600">
            Tên
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="border border-slate-500 px-2 py-1 rounded-md 
            focus:outline-none
            focus:border-transparent
            focus:shadow-[0px_0px_1px_3px_rgb(56,189,258)]"
            ref={userName}
          />
          {error ? (
            <small className="text-red-600 text-center">{error}</small>
          ) : null}
          {user ? (
            user.error ? (
              <small className="text-red-600 text-center">{user.error}</small>
            ) : null
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
            disabled={
              uploadingImagePending || user === "pending" ? true : false
            }
          >
            {uploadingImagePending || user === "pending" ? (
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
              "Đăng ký"
            )}
          </button>
        </form>
      </div>

      <div
        className="col-start-5 col-span-8
      sm:hidden sm:col-auto"
      >
        <img
          src={signupPic}
          x
          alt="landing image"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

export default Signup;
