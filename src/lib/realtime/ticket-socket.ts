import { io, type Socket } from "socket.io-client";
import type { Ticket } from "@/types/project-tasks.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

type TicketEventPayload =
  | {
      type: "ticket:created" | "ticket:updated";
      ticket: Ticket;
    }
  | {
      type: "ticket:deleted";
      ticketId: number;
    };

export type TicketRealtimeHandlers = {
  onConnected?: () => void;
  onDisconnected?: (reason: string) => void;
  onError?: (error: Error) => void;
  onTicketCreated?: (ticket: Ticket) => void;
  onTicketUpdated?: (ticket: Ticket) => void;
  onTicketDeleted?: (ticketId: number) => void;
};

export type TicketRealtimeConnection = {
  socket: Socket;
  disconnect: () => void;
};

function isTicketPayload(
  payload: TicketEventPayload,
): payload is Extract<TicketEventPayload, { ticket: Ticket }> {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "ticket" in payload &&
    !!(payload as any).ticket
  );
}

export function createTicketRealtimeConnection({
  token,
  projectId,
  handlers = {},
}: {
  token: string;
  projectId: number;
  handlers?: TicketRealtimeHandlers;
}): TicketRealtimeConnection {
  const socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  const joinProjectRoom = () => {
    socket.emit("watchProject", projectId);
  };

  socket.on("connect", () => {
    joinProjectRoom();
    handlers.onConnected?.();
  });

  socket.on("disconnect", (reason) => {
    handlers.onDisconnected?.(String(reason));
  });

  socket.on("connect_error", (error: Error) => {
    handlers.onError?.(error);
  });

  socket.on("ticket:created", (payload: TicketEventPayload) => {
    if (
      isTicketPayload(payload) &&
      payload.ticket.projectId === projectId
    ) {
      handlers.onTicketCreated?.(payload.ticket);
    }
  });

  socket.on("ticket:updated", (payload: TicketEventPayload) => {
    if (
      isTicketPayload(payload) &&
      payload.ticket.projectId === projectId
    ) {
      handlers.onTicketUpdated?.(payload.ticket);
    }
  });

  socket.on("ticket:deleted", (payload: TicketEventPayload) => {
    if (payload?.type === "ticket:deleted") {
      handlers.onTicketDeleted?.(payload.ticketId);
    }
  });

  const disconnect = () => {
    socket.emit("unwatchProject", projectId);
    socket.removeAllListeners();
    socket.disconnect();
  };

  return { socket, disconnect };
}
