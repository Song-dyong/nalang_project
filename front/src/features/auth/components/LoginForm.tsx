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
    <div>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        ></input>
        <button type="submit" disabled={loading}>
          {loading ? "Logining... " : "Login"}
        </button>
        {error && <p>Error: {error}</p>}
      </form>
      <div>
        <h3>Social Login</h3>
        <a href={`${import.meta.env.VITE_SERVER_URL}/auth/google/login`}>
          <button>Google Login</button>
        </a>
        <a href={`${import.meta.env.VITE_SERVER_URL}/auth/line/login`}>
          <button>Line Login</button>
        </a>
        <a href={`${import.meta.env.VITE_SERVER_URL}/auth/naver/login`}>
          <button>Naver Login</button>
        </a>
        <a href={`${import.meta.env.VITE_SERVER_URL}/auth/kakao/login`}>
          <button>Kakao Login</button>
        </a>
      </div>
    </div>
  );
};
