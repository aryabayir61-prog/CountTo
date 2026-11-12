import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SharedStageRoomState,
  StageEventSnapshot,
  StageReactionEvent,
  StageReactionType,
} from '../types/countdown';

export interface FloatingStageReaction extends StageReactionEvent {
  lane: number;
  scale: number;
}

export type StageConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

const USERNAME_STORAGE_KEY = 'countto_stage_username_v1';
const PARTICIPANT_ID_STORAGE_KEY = 'countto_stage_participant_id_v1';

function getOrCreateParticipantId(): string {
  if (typeof window === 'undefined') return 'local-user';
  try {
    let existing = sessionStorage.getItem(PARTICIPANT_ID_STORAGE_KEY);
    if (!existing) {
      existing =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(PARTICIPANT_ID_STORAGE_KEY, existing);
    }
    return existing;
  } catch {
    return `user-${Date.now()}`;
  }
}

export function getSavedStageUsername(): string {
  if (typeof window === 'undefined') return 'Misafir';
  try {
    const saved = localStorage.getItem(USERNAME_STORAGE_KEY);
    return saved && saved.trim() ? saved.trim() : 'Misafir';
  } catch {
    return 'Misafir';
  }
}

export function saveStageUsername(name: string): string {
  const clean = name.trim().slice(0, 32) || 'Misafir';
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, clean);
    } catch {
      // Ignore storage quota errors
    }
  }
  return clean;
}

function updateRoomQueryParam(roomCode: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (roomCode) {
      url.searchParams.set('room', roomCode);
    } else {
      url.searchParams.delete('room');
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history restrictions
  }
}

interface UseSharedStageRoomOptions {
  onRemoteStateSync?: (room: SharedStageRoomState) => void;
  onReactionReceived?: (reaction: StageReactionEvent) => void;
  onRemoteCelebration?: (senderName: string) => void;
}

export function useSharedStageRoom(options: UseSharedStageRoomOptions = {}) {
  const [roomState, setRoomState] = useState<SharedStageRoomState | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<StageConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingStageReaction[]>([]);
  const [participantName, setParticipantNameState] = useState<string>(getSavedStageUsername);

  const wsRef = useRef<WebSocket | null>(null);
  const desiredRoomCodeRef = useRef<string | null>(null);
  const fallbackEventRef = useRef<StageEventSnapshot | undefined>(undefined);
  const clapActiveRef = useRef<boolean>(false);
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenReactionIdsRef = useRef<Set<string>>(new Set());
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const participantNameRef = useRef(participantName);
  participantNameRef.current = participantName;

  const pushFloatingReaction = useCallback((reaction: StageReactionEvent) => {
    if (seenReactionIdsRef.current.has(reaction.reactionId)) {
      return;
    }
    seenReactionIdsRef.current.add(reaction.reactionId);
    if (seenReactionIdsRef.current.size > 300) {
      const first = seenReactionIdsRef.current.values().next().value;
      if (first) seenReactionIdsRef.current.delete(first);
    }

    const lane = 8 + Math.random() * 84; // 8%..92% viewport width
    const scale = reaction.viaClap ? 1.15 : 0.96 + Math.random() * 0.22;

    setFloatingReactions((prev) => [
      ...prev.slice(-28),
      {
        ...reaction,
        lane,
        scale,
      },
    ]);

    callbacksRef.current.onReactionReceived?.(reaction);

    setTimeout(() => {
      setFloatingReactions((prev) =>
        prev.filter((item) => item.reactionId !== reaction.reactionId)
      );
    }, 3300);
  }, []);

  const connectAndJoin = useCallback(
    (
      roomCode: string,
      customName?: string,
      initialEvent?: StageEventSnapshot,
      isReconnect = false
    ) => {
      const normalized = roomCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 12);
      if (!normalized) return;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (customName !== undefined) {
        const saved = saveStageUsername(customName);
        setParticipantNameState(saved);
        participantNameRef.current = saved;
      }

      desiredRoomCodeRef.current = normalized;
      if (initialEvent) {
        fallbackEventRef.current = initialEvent;
      }

      setErrorMessage(null);
      setConnectionStatus(isReconnect ? 'reconnecting' : 'connecting');

      const sendJoinPayload = (socket: WebSocket) => {
        socket.send(
          JSON.stringify({
            type: 'room:join',
            roomCode: normalized,
            participantId: getOrCreateParticipantId(),
            participantName: participantNameRef.current,
            clapActive: clapActiveRef.current,
            initialEvent: fallbackEventRef.current,
          })
        );
      };

      const existingWs = wsRef.current;
      if (existingWs && existingWs.readyState === WebSocket.OPEN) {
        sendJoinPayload(existingWs);
        return;
      }

      if (existingWs) {
        existingWs.onclose = null;
        existingWs.onerror = null;
        existingWs.close();
        wsRef.current = null;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionStatus('connected');
        sendJoinPayload(ws);
      };

      ws.onmessage = (event) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(String(event.data));
        } catch {
          return;
        }

        const type = String(msg.type || '');

        if (type === 'room:state' && msg.room) {
          const room = msg.room as SharedStageRoomState;
          setRoomState(room);
          if (typeof msg.selfId === 'string') {
            setSelfId(msg.selfId);
          }
          setErrorMessage(null);
          updateRoomQueryParam(room.roomCode);
          callbacksRef.current.onRemoteStateSync?.(room);
          return;
        }

        if (type === 'room:presence') {
          setRoomState((prev: SharedStageRoomState | null) => {
            if (!prev) return prev;
            return {
              ...prev,
              participants: Array.isArray(msg.participants)
                ? (msg.participants as SharedStageRoomState['participants'])
                : prev.participants,
              participantCount:
                typeof msg.participantCount === 'number'
                  ? msg.participantCount
                  : prev.participantCount,
            };
          });
          return;
        }

        if (type === 'room:reaction' && msg.reaction) {
          const reaction = msg.reaction as StageReactionEvent;
          setRoomState((prev: SharedStageRoomState | null) => {
            if (!prev) return prev;
            return {
              ...prev,
              totalClaps:
                typeof msg.totalClaps === 'number' ? msg.totalClaps : prev.totalClaps,
              totalReactions:
                typeof msg.totalReactions === 'number'
                  ? msg.totalReactions
                  : prev.totalReactions,
            };
          });
          pushFloatingReaction(reaction);
          return;
        }

        if (type === 'room:celebrate') {
          const senderName =
            typeof msg.senderName === 'string' ? msg.senderName : 'Bir Katılımcı';
          const reactionId =
            typeof msg.reactionId === 'string'
              ? msg.reactionId
              : `cel-${Date.now()}-${Math.random()}`;
          pushFloatingReaction({
            reactionId,
            type: 'confetti',
            senderId: typeof msg.senderId === 'string' ? msg.senderId : 'remote',
            senderName,
            viaClap: false,
            timestamp: Date.now(),
          });
          callbacksRef.current.onRemoteCelebration?.(senderName);
          return;
        }

        if (type === 'room:error') {
          const message =
            typeof msg.message === 'string'
              ? msg.message
              : 'Odaya bağlanırken bir sorun oluştu.';
          setErrorMessage(message);
          desiredRoomCodeRef.current = null;
          setConnectionStatus('disconnected');
          updateRoomQueryParam(null);
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        const targetCode = desiredRoomCodeRef.current;
        if (targetCode) {
          setConnectionStatus('reconnecting');
          const attempt = reconnectAttemptRef.current;
          reconnectAttemptRef.current = attempt + 1;
          const delay = Math.min(8000, 1000 * Math.pow(2, attempt));
          reconnectTimerRef.current = setTimeout(() => {
            if (desiredRoomCodeRef.current === targetCode) {
              connectAndJoin(targetCode, undefined, fallbackEventRef.current, true);
            }
          }, delay);
        } else {
          setConnectionStatus('disconnected');
        }
      };

      ws.onerror = () => {
        // Handled cleanly by onclose reconnect cycle
      };
    },
    [pushFloatingReaction]
  );

  // Auto-join if ?room=XXXXXX is present in the URL on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    if (roomCode && roomCode.trim()) {
      const urlTitle = params.get('title');
      const urlTarget = params.get('target');
      const urlFallback: StageEventSnapshot | undefined =
        urlTitle && urlTarget
          ? {
              title: urlTitle,
              targetDate: urlTarget,
              createdAt: new Date().toISOString(),
              style: (params.get('style') as StageEventSnapshot['style']) || 'countTo',
              theme: (params.get('theme') as StageEventSnapshot['theme']) || 'aurora',
              notes: params.get('notes') || undefined,
              showMilliseconds: false,
              isPaused: false,
            }
          : undefined;
      connectAndJoin(roomCode, undefined, urlFallback, false);
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectAndJoin]);

  const createRoom = useCallback(
    async (
      initialEvent: StageEventSnapshot,
      customName?: string
    ): Promise<string | null> => {
      setErrorMessage(null);
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: initialEvent }),
        });
        if (!res.ok) {
          setErrorMessage('Yeni ortak sahne odası oluşturulamadı.');
          return null;
        }
        const data = (await res.json()) as { roomCode?: string };
        if (!data.roomCode) return null;
        connectAndJoin(data.roomCode, customName, initialEvent, false);
        return data.roomCode;
      } catch {
        setErrorMessage('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        return null;
      }
    },
    [connectAndJoin]
  );

  const joinRoom = useCallback(
    (roomCode: string, customName?: string) => {
      fallbackEventRef.current = undefined;
      connectAndJoin(roomCode, customName, undefined, false);
    },
    [connectAndJoin]
  );

  const leaveRoom = useCallback(() => {
    desiredRoomCodeRef.current = null;
    fallbackEventRef.current = undefined;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'room:leave' }));
      } catch {
        // Ignore
      }
    }
    if (ws) {
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
    }

    setRoomState(null);
    setSelfId(null);
    setConnectionStatus('disconnected');
    setErrorMessage(null);
    updateRoomQueryParam(null);
  }, []);

  const updateRoomEvent = useCallback((patch: Partial<StageEventSnapshot>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'room:update_event',
          patch,
        })
      );
    }
  }, []);

  const sendReaction = useCallback(
    (reactionType: StageReactionType, viaClap = false) => {
      const reactionId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `rx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN && desiredRoomCodeRef.current) {
        ws.send(
          JSON.stringify({
            type: 'room:reaction',
            reactionType,
            reactionId,
            viaClap,
          })
        );
      } else {
        // Solo stage mode: still display floating reaction immediately for local clap/reaction feedback!
        pushFloatingReaction({
          reactionId,
          type: reactionType,
          senderId: getOrCreateParticipantId(),
          senderName: participantNameRef.current || 'Sen',
          viaClap,
          timestamp: Date.now(),
        });
      }
    },
    [pushFloatingReaction]
  );

  const sendCelebration = useCallback(() => {
    const reactionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `cel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && desiredRoomCodeRef.current) {
      ws.send(
        JSON.stringify({
          type: 'room:celebrate',
          reactionId,
        })
      );
    } else {
      pushFloatingReaction({
        reactionId,
        type: 'confetti',
        senderId: getOrCreateParticipantId(),
        senderName: participantNameRef.current || 'Sen',
        viaClap: false,
        timestamp: Date.now(),
      });
      callbacksRef.current.onRemoteCelebration?.(participantNameRef.current || 'Sen');
    }
  }, [pushFloatingReaction]);

  const updateMicStatus = useCallback((clapActive: boolean, newName?: string) => {
    clapActiveRef.current = clapActive;
    if (newName !== undefined) {
      const saved = saveStageUsername(newName);
      setParticipantNameState(saved);
      participantNameRef.current = saved;
    }

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && desiredRoomCodeRef.current) {
      ws.send(
        JSON.stringify({
          type: 'room:mic_status',
          clapActive,
          name: newName !== undefined ? participantNameRef.current : undefined,
        })
      );
    }
  }, []);

  return {
    roomState,
    selfId,
    isInRoom: Boolean(roomState),
    connectionStatus,
    errorMessage,
    floatingReactions,
    participantName,
    setParticipantName: (name: string) => updateMicStatus(clapActiveRef.current, name),
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoomEvent,
    sendReaction,
    sendCelebration,
    updateMicStatus,
    clearError: () => setErrorMessage(null),
  };
}
