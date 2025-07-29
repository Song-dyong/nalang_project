import { useEffect, useState } from "react";
import { fetchCallToken } from "../apis/callApi";
import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";
import { useNavigate, useParams } from "react-router-dom";

export const VoiceCallRoom = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken || !roomName) {
      console.warn("잘못된 접근입니다!");
      navigate("/");
      return;
    }
    fetchCallToken(roomName)
      .then(setToken)
      .catch((err) => {
        console.error("토큰 발급 실패", err);
        alert("통화방 접속 실패");
        navigate("/");
      });
  }, [roomName, navigate]);

  if (!token) return <div>Connecting...</div>;

  if (!ready)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Voice Chat 대기 중...</h2>
        <button onClick={() => setReady(true)}>통화 시작</button>
      </div>
    );

  return (
    <LiveKitRoom
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_WS_URL}
      connect={true}
      video={false}
      audio={true}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <h2>Voice Chat Room: {roomName}</h2>
    </LiveKitRoom>
  );
};
