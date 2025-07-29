import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallWebSocket } from "../../../hooks/useCallWebSocket";
import { fetchCallToken } from "../apis/callApi";
import type { MatchProposalMessage } from "../types/wsTypes";

export const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { connect, send, message, disconnect } = useCallWebSocket();
  const [matchInfo, setMatchInfo] = useState<MatchProposalMessage>();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    const searchParams = new URLSearchParams(location.search);
    const filters = {
      genderId: Number(searchParams.get("genderId")),
      languageId: Number(searchParams.get("languageId")),
      minAge: Number(searchParams.get("minAge")),
      maxAge: Number(searchParams.get("maxAge")),
    };

    connect(accessToken, filters);
    return () => {
      if (matchInfo?.room) {
        send({ event: "rejected", room: matchInfo.room });
      }
      disconnect();
    };
  }, [location]);

  // WebSocket 메시지 수신 처리
  useEffect(() => {
    if (!message) return;

    if (message?.event === "match_proposal") {
      setMatchInfo(message);
      setCountdown(10);
    }

    if (message.event === "disconnected") {
      setMatchInfo(undefined);
      setCountdown(0);

      // 다시 필터 정보를 기반으로 재등록
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const searchParams = new URLSearchParams(location.search);
      const filters = {
        genderId: Number(searchParams.get("genderId")),
        languageId: Number(searchParams.get("languageId")),
        minAge: Number(searchParams.get("minAge")),
        maxAge: Number(searchParams.get("maxAge")),
      };

      connect(accessToken, filters);
    }

    if (message.event === "rejected") {
      setMatchInfo(undefined);
      setCountdown(0);
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const searchParams = new URLSearchParams(location.search);
      const filters = {
        genderId: Number(searchParams.get("genderId")),
        languageId: Number(searchParams.get("languageId")),
        minAge: Number(searchParams.get("minAge")),
        maxAge: Number(searchParams.get("maxAge")),
      };

      connect(accessToken, filters);
    }
  }, [message]);

  // 타이머 동작
  useEffect(() => {
    if (!matchInfo) return;
    if (countdown <= 0) {
      enterVoiceRoom();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, matchInfo]);

  const enterVoiceRoom = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken || !matchInfo?.room) return;
    try {
      const token = await fetchCallToken(matchInfo.room);
      navigate(`/voice-room/${matchInfo.room}`, { state: { token } });
    } catch (err) {
      console.error("토큰 발급 실패", err);
    }
  };

  const handleReject = () => {
    send({ event: "rejected", room: matchInfo?.room }); 
    setMatchInfo(undefined);
    setCountdown(0);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center gap-6">
      {!matchInfo ? (
        <p className="text-xl">대화 상대를 찾는 중입니다...</p>
      ) : (
        <div className="text-center">
          <p className="text-xl">상대방을 찾았습니다!</p>
          <p className="mt-2">10초 후 자동 입장됩니다...</p>
          <p className="text-3xl font-bold mt-1">{countdown}초</p>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleReject}
          >
            거절하기
          </button>
        </div>
      )}
    </div>
  );
};
