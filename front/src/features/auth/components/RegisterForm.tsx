import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../slices/authSlice";
import type { AppDispatch, RootState } from "../../../stores/store";
import { useNavigate } from "react-router-dom";

export const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerThunk({ email, name, password }));
  };

  useEffect(() => {
    console.log("user state changed:", user); // 👈 로그 찍어보기
    if (user) {
      navigate("/profile/setup");
    }
  }, [user, navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button type="submit" disabled={loading}>
        {loading ? "가입중 .. " : "가입하기"}
      </button>
      {error && <p style={{ color: "red" }}>에러: {error}</p>}
      {user && <p style={{ color: "green" }}>환영합니다, {user.name}님!</p>}
    </form>
  );
};
