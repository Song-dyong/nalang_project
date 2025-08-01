import {
  useRoomContext,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfileResponse } from "../../auth/types/authTypes";
import { LogOut } from "lucide-react";
import { Track } from "livekit-client";

interface Props {
  partnerData?: UserProfileResponse;
}

export const CustomRoomUI = ({ partnerData }: Props) => {
  const room = useRoomContext();
  const navigate = useNavigate();
  const tracks = useTracks([Track.Source.Camera]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300);
  const [extended, setExtended] = useState(false);

  // 상대방 퇴장 감지
  useEffect(() => {
    const handleParticipantDisconnected = () => {
      alert("상대방이 나갔습니다. 홈으로 돌아갑니다.");
      room.disconnect();
      navigate("/home");
    };
    room.on("participantDisconnected", handleParticipantDisconnected);
    return () => {
      room.off("participantDisconnected", handleParticipantDisconnected);
    };
  }, [room, navigate]);

  // 음성 감지
  useEffect(() => {
    const interval = setInterval(() => {
      let speaking = false;
      for (const participant of room.remoteParticipants.values()) {
        if (participant.audioLevel > 0.2) {
          speaking = true;
          break;
        }
      }
      setIsSpeaking(speaking);
    }, 300);
    return () => clearInterval(interval);
  }, [room]);

  // 타이머
  useEffect(() => {
    if (remainingTime <= 0) {
      alert("통화 시간이 종료되었습니다.");
      room.disconnect();
      navigate("/home");
      return;
    }
    const timer = setTimeout(() => setRemainingTime((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime, navigate, room]);

  // 연장 메시지 수신
  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload));
        if (message.type === "extend_time") {
          setRemainingTime((t) => t + message.payload);
          setExtended(true);
          setTimeout(() => setExtended(false), 3000);
        }
      } catch (e) {
        console.warn("데이터 파싱 실패:", e);
      }
    };
    room.on("dataReceived", handleData);
    return () => {
      room.off("dataReceived", handleData);
    };
  }, [room]);

  const handleLeave = () => {
    room.disconnect();
    navigate("/home");
  };

  const handleExtend = () => {
    const extendSec = 300;
    setRemainingTime((t) => t + extendSec);
    const message = JSON.stringify({ type: "extend_time", payload: extendSec });
    room.localParticipant.publishData(new TextEncoder().encode(message), {
      reliable: true,
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white relative px-4">
      <button
        className="absolute top-4 right-4 text-sm hover:bg-gray-300 px-3 py-1 rounded flex items-center gap-1"
        onClick={handleLeave}
      >
        <LogOut size={16} />
      </button>

      <button
        className="absolute top-4 left-2 text-xs bg-[#A6DAF4] hover:bg-[#91cfee] text-white px-3 py-1 rounded shadow"
        onClick={handleExtend}
      >
        ⏱5분연장
      </button>

      <div className="relative mb-4">
        {partnerData?.image_path ? (
          <img
            src={partnerData.image_path}
            alt="상대방"
            className={`w-32 h-32 rounded-full object-cover border-4 ${
              isSpeaking ? "border-blue-400 animate-pulse" : "border-gray-300"
            }`}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl text-white">
            🤖
          </div>
        )}
        {extended && (
          <div className="absolute top-[-1.5rem] left-1/2 -translate-x-1/2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded shadow">
            상대방이 5분 연장했어요!
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-[#336D92]">
        {partnerData?.name || "상대방"}
      </p>

      <div className="mt-4 space-y-2 text-sm text-center">
        {partnerData?.gender && (
          <div className="flex justify-center items-center gap-2">
            <span>👤</span>
            <span className="px-3 py-1 bg-[#B0E3FF] text-white rounded-full">
              {partnerData.gender}
            </span>
          </div>
        )}
        {partnerData?.languages?.length > 0 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <span>🗣</span>
            {partnerData?.languages.map((lang: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#C5E8D2] text-white rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
        {partnerData?.interests?.length > 0 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <span>⭐</span>
            {partnerData?.interests.map((interest: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#F8D4EB] text-white rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-lg font-semibold text-[#548CA8]">
        <span>🕒</span>
        <span>
          {Math.floor(remainingTime / 60)}:
          {(remainingTime % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        {tracks
          .filter(
            (
              trackRef
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ): trackRef is Extract<typeof trackRef, { publication: any }> =>
              !!trackRef.publication
          )
          .map((trackRef) => (
            <div
              key={`${trackRef.participant.identity}-${trackRef.publication.trackSid}`}
              className="rounded overflow-hidden shadow bg-black w-48 h-32"
            >
              <VideoTrack trackRef={trackRef} />
            </div>
          ))}
      </div>
    </div>
  );
};
