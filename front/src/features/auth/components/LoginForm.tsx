import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../stores/store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginThunk } from "../slices/authSlice";

export const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginThunk({ username, password })).then(() => {
      navigate("/home");
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">로그인</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          {error && <p className="text-red-500 text-sm">오류: {error}</p>}
        </form>

        <div className="mt-6">
          <h3 className="text-center mb-2 text-sm text-gray-500">
            소셜 로그인
          </h3>
          <div className="flex flex-col gap-2">
            <a href={`${import.meta.env.VITE_SERVER_URL}/auth/google/login`}>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
                Google 로그인
              </button>
            </a>
            <a href={`${import.meta.env.VITE_SERVER_URL}/auth/line/login`}>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded">
                LINE 로그인
              </button>
            </a>
            <a href={`${import.meta.env.VITE_SERVER_URL}/auth/naver/login`}>
              <button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded">
                Naver 로그인
              </button>
            </a>
            <a href={`${import.meta.env.VITE_SERVER_URL}/auth/kakao/login`}>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded">
                Kakao 로그인
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
