import { Room } from "livekit-client";
import { useEffect, useState } from "react";

export const useLiveKit = (token: string | undefined) => {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!token) return;

    const room = new Room();
    setRoom(room);

    const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
    room.connect(wsUrl, token).then(() => {
      console.log("연결 성공!");
      room.localParticipant.setMicrophoneEnabled(true);
    });

    return () => {
      room.disconnect();
    };
  }, [token]);

  return { room };
};
