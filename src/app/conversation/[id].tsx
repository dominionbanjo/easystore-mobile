import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { AppImage } from '@/components/shared/AppImage';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} from '@/api/messagingApi';
import { useSocket } from '@/hooks/useSocket';
import { useAppSelector } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IMessage } from '@/types/messaging';

export default function ConversationScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const scrollRef = useRef<ScrollView>(null);

  const { data: initialMessages } = useGetMessagesQuery({ conversationId: params.id });
  const [sendMessage] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const socket = useSocket();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    socket.joinConversation(params.id);
    markRead(params.id);
    return () => {
      socket.leaveConversation(params.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    const unsubscribe = socket.on('new_direct_message', (message) => {
      const incoming = message as IMessage;
      if (incoming.conversation_id === params.id) {
        setMessages((current) => {
          if (current.some((existing) => existing.id === incoming.id)) {
            return current;
          }
          return [...current, incoming];
        });
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) {
      return;
    }
    setDraft('');
    setSending(true);
    try {
      await sendMessage({ conversationId: params.id, content }).unwrap();
    } catch (error) {
      toast.showError(getErrorMessage(error));
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Chat', headerShown: true }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => {
            const isMine = message.sender_id === user?.id;
            return (
              <View
                key={message.id}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  backgroundColor: isMine ? colors.primary : colors.surface,
                  borderRadius: 16,
                  borderBottomRightRadius: isMine ? 4 : 16,
                  borderBottomLeftRadius: isMine ? 16 : 4,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: isMine ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                {message.product ? (
                  <Row style={{ gap: spacing.sm, marginBottom: 4 }}>
                    <AppImage
                      uri={message.product.image}
                      style={{ width: 36, height: 36 }}
                      fallbackText={message.product.name}
                    />
                    <AppText variant="small" weight="semibold" numberOfLines={1}>
                      {message.product.name}
                    </AppText>
                  </Row>
                ) : null}
                <AppText variant="label" color={isMine ? colors.primaryForeground : colors.text}>
                  {message.content}
                </AppText>
                <AppText
                  variant="small"
                  style={{ marginTop: 2 }}
                  color={isMine ? colors.primaryForeground : colors.textSubtle}
                >
                  {new Date(message.created_at).toLocaleTimeString('en-NG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={colors.textSubtle}
            multiline
            style={{
              flex: 1,
              minHeight: 44,
              maxHeight: 110,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 22,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !draft.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: !draft.trim() ? colors.surfaceAlt : colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending ? 0.5 : 1,
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={!draft.trim() ? colors.textSubtle : '#ffffff'}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
