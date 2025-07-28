import { useDispatch, useSelector } from "react-redux";
import { CallWaitingButton } from "../features/voiceChat/components/CallWaitingButton";
import type { AppDispatch, RootState } from "../stores/store";
import { useNavigate } from "react-router-dom";
import { logoutThunk } from "../features/auth/slices/authSlice";

export const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate("/login");
  };

  const goToProfile = () => {
    navigate("/profile/setup");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
      <div className="top-4 right-4">
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
        >
          로그아웃
        </button>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-center space-y-4">
        <h2 className="text-xl font-semibold">
          👋 {user?.name}님, 환영합니다!
        </h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>

        <CallWaitingButton />

        <div className="pt-4 space-y-2 border-t">
          <button
            onClick={goToProfile}
            className="w-full border border-blue-500 text-blue-500 hover:bg-blue-50 rounded py-2"
          >
            프로필 수정
          </button>
          <button
            disabled
            className="w-full border border-gray-400 text-gray-400 bg-gray-100 rounded py-2 cursor-not-allowed"
          >
            (예정) 통화 기록 보기
          </button>
        </div>
      </div>
    </div>
  );
};
