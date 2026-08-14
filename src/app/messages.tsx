import { useRouter , Stack } from 'expo-router';
import { View } from 'react-native';


import { MessagesSquare } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGetConversationsQuery } from '@/api/messagingApi';

export default function MessagesScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();

  const { data: conversations, isLoading } = useGetConversationsQuery(undefined, {
    pollingInterval: 15000,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Messages', headerShown: true }} />
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ padding: spacing.lg }}>
            <ListSkeleton count={5} />
          </View>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation) => {
            const participant = conversation.other_participant;
            return (
              <Card
                key={conversation.id}
                onPress={() =>
                  router.push({ pathname: '/conversation/[id]', params: { id: conversation.id } })
                }
                padded={false}
                style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md }}
              >
                <Row style={{ gap: spacing.md }}>
                  <AppImage
                    uri={participant?.avatar}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    fallbackText={`${participant?.first_name[0] ?? ''}${participant?.last_name[0] ?? ''}`}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <AppText variant="label" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                        {participant?.first_name ?? 'User'}{' '}
                        {participant?.last_name ?? ''}
                      </AppText>
                      {conversation.last_message_at ? (
                        <AppText variant="small" color={colors.textSubtle}>
                          {new Date(conversation.last_message_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </AppText>
                      ) : null}
                    </Row>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <AppText
                        variant="small"
                        color={conversation.unread_count ? colors.text : colors.textMuted}
                        numberOfLines={1}
                        style={{ flex: 1 }}
                      >
                        {conversation.last_message_preview ?? 'Start a conversation'}
                      </AppText>
                      {conversation.unread_count ? (
                        <View
                          style={{
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                          }}
                        >
                          <AppText variant="small" weight="bold" color={colors.primaryForeground}>
                            {conversation.unread_count}
                          </AppText>
                        </View>
                      ) : null}
                    </Row>
                  </View>
                </Row>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={<MessagesSquare size={32} color={colors.textSubtle} />}
            title="No conversations yet"
            description="Messages from buyers and sellers appear here"
          />
        )}
      </View>
    </>
  );
}
