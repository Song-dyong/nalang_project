import { useState } from "react";
import type { IncomingMessage } from "../features/voiceChat/types/wsTypes";

type WebSocketState = {
  socket: WebSocket | null;
  connected: boolean;
  message: IncomingMessage | null;
  send: (data: object) => void;
  connect: (token: string) => void;
  disconnect: () => void;
};

export const useCallWebSocket = (): WebSocketState => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<IncomingMessage | null>(null);

  const connect = (token: string) => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_SERVER_WS_URL}/ws/waiting?token=${token}`
    );
    setSocket(ws);
    setConnected(true);
    ws.onopen = () => console.log("웹소켓 연결됨");
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as IncomingMessage;
        console.log("parsed >>> ", parsed);
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
