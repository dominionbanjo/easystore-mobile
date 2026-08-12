import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
  iconColor,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View style={{ marginBottom: spacing.md, gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          {icon ? (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                backgroundColor: `${iconColor ?? '#17c06e'}14`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={icon} size={20} color={iconColor ?? '#17c06e'} />
            </View>
          ) : null}
          <AppText style={{ fontSize: 20, letterSpacing: -0.4 }} weight="black">
            {title}
          </AppText>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <AppText style={{ fontSize: 13 }} weight="bold" color="#17c06e">
              {actionLabel}
            </AppText>
            <Ionicons name="arrow-forward" size={13} color="#17c06e" />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <AppText variant="caption" color={colors.textMuted}>
          {subtitle}
        </AppText>
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
