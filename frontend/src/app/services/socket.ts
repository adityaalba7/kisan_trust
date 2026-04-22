/**
 * Socket.IO Client Service
 * 
 * Manages WebSocket connection for real-time chat.
 */
import { io, Socket } from "socket.io-client";
import { getToken, getLenderToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3000";

let socket: Socket | null = null;

/**
 * Connect to Socket.IO server with JWT auth.
 * Automatically detects farmer vs lender token.
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getToken() || getLenderToken();
  if (!token) throw new Error("No auth token");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Socket error:", err.message);
  });

  return socket;
}

/**
 * Get the current socket instance (or connect).
 */
export function getSocket(): Socket {
  if (!socket?.connected) return connectSocket();
  return socket;
}

/**
 * Disconnect the socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Send a chat message.
 */
export function sendMessage(partnerId: string, partnerRole: string, text: string, senderName: string) {
  const s = getSocket();
  s.emit("send_message", { partnerId, partnerRole, text, senderName });
}

/**
 * Emit typing / stop_typing events.
 */
export function emitTyping(partnerId: string, partnerRole: string) {
  getSocket().emit("typing", { partnerId, partnerRole });
}

export function emitStopTyping(partnerId: string, partnerRole: string) {
  getSocket().emit("stop_typing", { partnerId, partnerRole });
}

/**
 * Mark messages as read.
 */
export function markRead(conversationId: string) {
  getSocket().emit("mark_read", { conversationId });
}
