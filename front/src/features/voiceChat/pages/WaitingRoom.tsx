import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallWebSocket } from "../../../hooks/useCallWebSocket";
import { fetchCallToken, getPartnerData } from "../apis/callApi";
import type { MatchProposalMessage } from "../types/wsTypes";
import type { UserProfileResponse } from "../../auth/types/authTypes";
export const WaitingRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { connect, send, message, disconnect } = useCallWebSocket();
  const [matchInfo, setMatchInfo] = useState<MatchProposalMessage>();
  const [countdown, setCountdown] = useState(10);

  const [partnerData, setPartnerData] = useState<UserProfileResponse>();

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

  useEffect(() => {
    if (!message) return;

    if (message?.event === "match_proposal") {
      setMatchInfo(message);
      console.log("matchInfo !! >> ", message);
      setCountdown(5);

      getPartnerData(message.partner_id)
        .then((data) => {
          console.log("Partner Data >>> ", data);
          setPartnerData(data);
        })
        .catch((err) => console.log("파트너 정보 로딩 실패", err));
    }

    if (message.event === "disconnected") {
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
      navigate(`/voice-room/${matchInfo.room}`, {
        state: { token, partnerData },
      });
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
    <div className="h-full flex flex-col justify-center items-center bg-gradient-to-b from-[#e1f4fc] to-white">
      {!matchInfo ? (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-24 h-24 border-[6px] border-[#A6DAF4] border-dashed rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-medium text-[#548CA8] animate-pulse">
            대화 상대를 찾는 중입니다...
          </p>
        </div>
      ) : (
        <div className="text-center animate-fade-in-up">
          {/* 상대방 프로필 이미지 */}
          {partnerData && (
            <div className="flex flex-col items-center mb-4">
              {partnerData.image_path ? (
                <img
                  src={partnerData.image_path}
                  alt="상대방 프로필"
                  className="w-24 h-24 rounded-full shadow-md object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white">
                  🤖
                </div>
              )}
              <p className="mt-2 text-lg font-semibold text-[#336D92]">
                {partnerData.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center max-w-xs">
                {partnerData.interests.map((interest: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm bg-[#A6DAF4] text-white rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xl font-semibold text-[#336D92]">
            상대방을 찾았습니다!
          </p>
          <p className="mt-1 text-[#548CA8]">곧 입장합니다...</p>
          <p className="text-4xl font-bold mt-2 text-[#336D92]">
            {countdown}초
          </p>
          <button
            className="mt-6 px-6 py-2 bg-[#A6DAF4] hover:bg-[#8fd1f2] text-white font-semibold rounded-lg transition duration-200"
            onClick={handleReject}
          >
            다른 사람 찾기
          </button>
        </div>
      )}
    </div>
  );
};
