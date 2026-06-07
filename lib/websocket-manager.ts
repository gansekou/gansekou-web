"use client";

import { ENDPOINTS } from "@/lib/endpoints";

type EventHandler = (event: unknown) => void;
type StatusHandler = (connected: boolean) => void;

class RealtimeManager {
  private socket: WebSocket | null = null;
  private userId: string | null = null;
  private retry = 0;
  private reconnectTimer = 0;
  private manuallyClosed = false;
  private events = new Set<EventHandler>();
  private statuses = new Set<StatusHandler>();
  private pendingEvents: unknown[] = [];
  private flushTimer = 0;
  private listenersBound = false;

  connect(userId: string) {
    if (!userId || this.userId === userId && this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.bindBrowserListeners();
    this.close(false);
    this.userId = userId;
    this.manuallyClosed = false;
    this.open();
  }

  close(manual = true) {
    this.manuallyClosed = manual;
    if (manual) this.userId = null;
    window.clearTimeout(this.reconnectTimer);
    window.clearTimeout(this.flushTimer);
    this.socket?.close();
    this.socket = null;
    this.emitStatus(false);
  }

  subscribe(onEvent: EventHandler, onStatus: StatusHandler) {
    this.events.add(onEvent);
    this.statuses.add(onStatus);
    onStatus(this.socket?.readyState === WebSocket.OPEN);

    return () => {
      this.events.delete(onEvent);
      this.statuses.delete(onStatus);
      if (this.events.size === 0 && this.statuses.size === 0) this.close(true);
    };
  }

  private bindBrowserListeners() {
    if (this.listenersBound || typeof window === "undefined") return;
    this.listenersBound = true;

    window.addEventListener("online", () => this.scheduleReconnect(250));
    window.addEventListener("offline", () => this.close(false));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.close(false);
        return;
      }
      this.scheduleReconnect(250);
    });
  }

  private open() {
    if (
      typeof window === "undefined" ||
      !this.userId ||
      this.manuallyClosed ||
      document.hidden ||
      !navigator.onLine ||
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.socket?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    const socket = new WebSocket(ENDPOINTS.realtime.websocket(this.userId));
    this.socket = socket;

    socket.onopen = () => {
      this.retry = 0;
      this.emitStatus(true);
    };

    socket.onmessage = (message) => {
      try {
        this.queueEvent(JSON.parse(message.data) as unknown);
      } catch {
        this.queueEvent({ type: "RAW", message: message.data });
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) this.socket = null;
      this.emitStatus(false);
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(initialDelay?: number) {
    if (!this.userId || this.manuallyClosed || !navigator.onLine || document.hidden) return;
    this.retry += 1;
    const jitter = Math.floor(Math.random() * 400);
    const delay = initialDelay ?? Math.min(60000, 800 * 2 ** this.retry + jitter);
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => this.open(), delay);
  }

  private queueEvent(event: unknown) {
    this.pendingEvents.push(event);
    if (this.pendingEvents.length > 50) {
      this.pendingEvents = this.pendingEvents.slice(-50);
    }
    if (this.flushTimer) return;
    this.flushTimer = window.setTimeout(() => {
      const latest =
        this.pendingEvents.length === 1
          ? this.pendingEvents[0]
          : { type: "BATCH", events: this.pendingEvents };
      this.pendingEvents = [];
      this.flushTimer = 0;
      if (latest) this.events.forEach((handler) => handler(latest));
    }, 250);
  }

  private emitStatus(connected: boolean) {
    this.statuses.forEach((handler) => handler(connected));
  }
}

export const realtimeSocketManager = new RealtimeManager();
export const realtimeManager = realtimeSocketManager;
