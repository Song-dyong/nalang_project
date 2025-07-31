import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import { CustomRoomUI } from "./CustomRoomUI";

export const VoiceCallRoom = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

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
      audio={true}
      video={true}
      onConnected={() => {
        setIsReady(true);
        console.log("LiveKit Connected!!!");
      }}
      style={{ height: "75vh" }}
    >
      {isReady && <CustomRoomUI partnerData={partnerData} />}
    </LiveKitRoom>
  );
};
