import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import { CustomRoomUI } from "./CustomRoomUI";

export const VoiceCallRoom = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const token = location.state?.token;
  const partnerData = location.state?.partnerData;

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken || !roomName) {
      console.warn("잘못된 접근입니다!");
      navigate("/");
      return;
    }
  }, [roomName, navigate]);

  if (!token) return <div>Connecting...</div>;

  return (
    <LiveKitRoom
      token={token}
      connectOptions={{ autoSubscribe: true }}
      serverUrl={import.meta.env.VITE_LIVEKIT_WS_URL}
      connect
      video={false}
      onConnected={() => {
        console.log("LiveKit Connected!!!");
      }}
      audio
      style={{ height: "70vh" }}
    >
      <CustomRoomUI partnerData={partnerData} />
    </LiveKitRoom>
  );
};
