import { Pressable, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
      }}
    >
      <AppText variant="subtitle" weight="bold">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" weight="semibold" color="#17c06e">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProductRail({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginVertical: 8 }}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      {children}
    </View>
  );
}
