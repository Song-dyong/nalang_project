import { useState } from "react";
import type { IncomingMessage } from "../features/voiceChat/types/wsTypes";

type WebSocketState = {
  socket: WebSocket | null;
  connected: boolean;
  message: IncomingMessage | null;
  send: (data: object) => void;
  connect: (
    token: string,
    filters?: {
      genderId?: number;
      minAge?: number;
      maxAge?: number;
      languageId?: number;
    }
  ) => void;
  disconnect: () => void;
};

export const useCallWebSocket = (): WebSocketState => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<IncomingMessage | null>(null);

  const connect = (
    token: string,
    filters?: {
      genderId?: number;
      minAge?: number;
      maxAge?: number;
      languageId?: number;
    }
  ) => {
    let url = `${import.meta.env.VITE_SERVER_WS_URL}/ws/waiting?token=${token}`;
    if (filters) {
      if (filters.genderId !== undefined)
        url += `&filter_gender_id=${filters.genderId}`;
      if (filters.minAge !== undefined)
        url += `&filter_min_age=${filters.minAge}`;
      if (filters.maxAge !== undefined)
        url += `&filter_max_age=${filters.maxAge}`;
      if (filters.languageId !== undefined)
        url += `&filter_language_id=${filters.languageId}`;
    }
    // ✅ 여기에 추가
    console.log("[WebSocket 연결 URL]:", url);
    console.log("[전달된 필터]:", filters);
    const ws = new WebSocket(url);
    setSocket(ws);
    setConnected(true);
    ws.onopen = () => console.log("웹소켓 연결됨");
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as IncomingMessage;
        setMessage(parsed);
      } catch (err) {
        console.log("웹소켓 메시지 파싱 에러", err);
      }
    };
    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
    };
  };

  const send = (data: object) => {
    if (socket && socket.readyState == WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
    }
  };

  return { socket, connected, message, send, connect, disconnect };
};
