// VoiceCallRoom.tsx
import { useEffect, useState } from "react";
import { fetchCallToken } from "../apis/callApi";
import "@livekit/components-styles";
import { LiveKitRoom } from "@livekit/components-react";

export const VoiceCallRoom = () => {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.warn("로그인 사용자가 아닙니다!");
      return;
    }
    fetchCallToken("room1", accessToken).then(setToken);
  }, []);

  if (!token) return <div>Connecting...</div>;

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
      <h2>Voice Chat Room</h2>
    </LiveKitRoom>
  );
};
