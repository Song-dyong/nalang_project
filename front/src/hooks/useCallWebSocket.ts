import { useRef, useState } from "react";
import type { IncomingMessage } from "../features/voiceChat/types/wsTypes";

type WebSocketState = {
  // socket: WebSocket | null;
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
  const socketRef = useRef<WebSocket | null>(null);
  // const [socket, setSocket] = useState<WebSocket | null>(null);
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
      if (filters.genderId !== undefined && filters.genderId !== 0)
        url += `&filter_gender_id=${filters.genderId}`;
      if (filters.minAge !== undefined && filters.minAge !== 0)
        url += `&filter_min_age=${filters.minAge}`;
      if (filters.maxAge !== undefined && filters.maxAge !== 0)
        url += `&filter_max_age=${filters.maxAge}`;
      if (filters.languageId !== undefined && filters.languageId !== 0)
        url += `&filter_language_id=${filters.languageId}`;
    }

    const ws = new WebSocket(url);
    socketRef.current = ws;
    // setSocket(ws);
    setConnected(true);
    ws.onopen = () => console.log("웹소켓 연결됨");
    ws.onmessage = (event) => {
      console.log("[WebSocket 수신 메시지]:", event.data);
      try {
        const parsed = JSON.parse(event.data) as IncomingMessage;
        setMessage(parsed);
      } catch (err) {
        console.log("웹소켓 메시지 파싱 에러", err);
      }
    };
    ws.onerror = (e) => {
      console.error("웹소켓 오류 발생:", e);
    };
    ws.onclose = () => {
      setConnected(false);
      // setSocket(null);
      socketRef.current = null;
    };
  };

  const send = (data: object) => {
    if (socketRef.current && socketRef.current.readyState == WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      console.log("웹소켓 끊김");
    }
  };

  return { connected, message, send, connect, disconnect };
};
