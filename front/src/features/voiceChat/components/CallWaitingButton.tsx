import { useEffect, useState } from "react";
import { useCallWebSocket } from "../../../hooks/useCallWebSocket";
import { useNavigate } from "react-router-dom";

export const CallWaitingButton = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("access_token");
  const { connect, send, message, connected } = useCallWebSocket();

  const handleClick = () => {
    if (!accessToken) {
      alert("로그인이 필요합니다!");
      return;
    }

    connect(accessToken);
    setStatusMessage("대기열에 등록 중 ...");
  };

  const handleCancel = () => {
    send({ event: "cancel" });
    setStatusMessage("대기 취소됨");
  };

  useEffect(() => {
    if (!message || !("event" in message)) return;
    switch (message.event) {
      case "match_proposal":
        setStatusMessage(`매칭 제안 Room: ${message.room}`);
        send({ event: "accept", room: message.room });
        break;
      case "matched":
        setStatusMessage(`매칭 완료! Room: ${message.room}`);
        navigate(`/voice-room/${message.room}`);
        break;
      case "rejected":
        setStatusMessage("상대 매칭 거절");
        break;
      case "disconnected":
        setStatusMessage("상대와 연결 종료");
        break;
      default:
        setStatusMessage("알 수 없는 메시지 수신");
    }
  }, [message, navigate, send]);

  return (
    <div className="space-y-3">
      {connected ? (
        <button
          onClick={handleCancel}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
        >
          대기 취소
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
        >
          통화하기
        </button>
      )}
      <p className="text-sm text-gray-600">{statusMessage}</p>
    </div>
  );
};
