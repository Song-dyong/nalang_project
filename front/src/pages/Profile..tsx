import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import newbie from "../assets/newbie.jpg";
import { useNavigate } from "react-router-dom";
import { Pencil, Phone, LogOut } from "lucide-react";
import { logoutThunk } from "../features/auth/slices/authSlice";

export const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <div className="relative h-full flex flex-col items-center px-6 pt-10">
      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 text-gray-500 hover:text-red-500 transition"
      >
        <LogOut size={24} />
      </button>

      {/* 프로필 이미지 */}
      <div className="relative">
        <img
          src={user?.image_path || newbie}
          className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
        />
        <div
          onClick={() => navigate("/profile/setup")}
          className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow -mb-1 -mr-1 hover:cursor-pointer"
        >
          <Pencil size={18} />
        </div>
      </div>

      {/* 사용자 닉네임 */}
      <p className="mt-4 text-lg font-bold text-gray-800">
        {user?.name || "의문의 고양이"}
      </p>

      {/* 통화 기록 메뉴 */}
      <div className="w-full mt-10">
        <button
          className="w-full flex items-center gap-3 px-4 py-4 
      bg-white text-gray-700 font-medium shadow 
      rounded-[30px] ring-1 ring-gray-200
      hover:bg-indigo-50 hover:text-indigo-600 
      active:bg-indigo-100 active:text-indigo-700
      transition-colors duration-200"
          onClick={() => navigate("/profile/history")}
        >
          <Phone className="w-5 h-5 text-gray-500" />
          <span>통화 기록</span>
        </button>
      </div>
    </div>
  );
};
