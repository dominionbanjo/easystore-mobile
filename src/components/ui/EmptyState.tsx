import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';
import { Button } from './Button';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xxl,
          gap: spacing.md,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <AppText variant="subtitle" weight="semibold" center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" color={colors.textMuted} center>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} size="sm" fullWidth={false} />
      ) : null}
    </View>
  );
}

export function ListFooter({ loading, hasMore }: { loading: boolean; hasMore: boolean }) {
  const { colors, spacing } = useAppTheme();
  if (!loading) {
    return null;
  }
  return (
    <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
      <AppText variant="small" color={colors.textSubtle}>
        {hasMore ? 'Loading more…' : 'End of list'}
      </AppText>
    </View>
  );
}
