import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL, TOKEN_STORAGE_KEY } from '../constants/api';
import { useAppSelector } from '../hooks';

export interface SocketEventMap {
  new_direct_message: (message: unknown) => void;
  new_chatroom_message: (message: unknown) => void;
  conversation_read: (data: unknown) => void;
  message_delivered: (data: unknown) => void;
  user_typing: (data: unknown) => void;
  user_stopped_typing: (data: unknown) => void;
  user_online: (data: unknown) => void;
  user_offline: (data: unknown) => void;
  online_users_list: (data: unknown) => void;
  chatroom_user_count: (data: unknown) => void;
}

export type SocketEventName = keyof SocketEventMap;

export interface MessagingSocket {
  connected: boolean;
  on<T extends SocketEventName>(event: T, listener: SocketEventMap[T]): () => void;
  emit(event: string, payload?: unknown): void;
  joinConversation(conversationId: string): void;
  leaveConversation(conversationId: string): void;
  joinChatroom(): void;
  leaveChatroom(): void;
  typing(conversationId: string, isTyping: boolean): void;
  markDelivered(conversationId: string): void;
  readConversation(conversationId: string): void;
}

export function useSocket(): MessagingSocket {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let cancelled = false;
    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      if (!token || cancelled) {
        return;
      }
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token },
      });
      socketRef.current = socket;
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
    })();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  const api: MessagingSocket = {
    connected,
    on<T extends SocketEventName>(event: T, listener: SocketEventMap[T]): () => void {
      const socket = socketRef.current;
      if (!socket) {
        return () => undefined;
      }
      socket.on(event as string, listener as never);
      return () => {
        socket.off(event as string, listener as never);
      };
    },
    emit(event: string, payload?: unknown): void {
      socketRef.current?.emit(event, payload);
    },
    joinConversation(conversationId: string): void {
      socketRef.current?.emit('join_conversation', { conversation_id: conversationId });
    },
    leaveConversation(conversationId: string): void {
      socketRef.current?.emit('leave_conversation', { conversation_id: conversationId });
    },
    joinChatroom(): void {
      socketRef.current?.emit('join_chatroom');
    },
    leaveChatroom(): void {
      socketRef.current?.emit('leave_chatroom');
    },
    typing(conversationId: string, isTyping: boolean): void {
      socketRef.current?.emit(isTyping ? 'typing_start' : 'typing_stop', {
        conversation_id: conversationId,
      });
    },
    markDelivered(conversationId: string): void {
      socketRef.current?.emit('mark_delivered', { conversation_id: conversationId });
    },
    readConversation(conversationId: string): void {
      socketRef.current?.emit('read_conversation', { conversation_id: conversationId });
    },
  };

  return api;
}
