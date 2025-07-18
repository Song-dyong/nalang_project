import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SocialCallbackPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      navigate("/home");
    } else {
      alert("Login Failed");
      navigate("/login");
    }
  }, [navigate]);

  return <p>Login Processing</p>;
};
