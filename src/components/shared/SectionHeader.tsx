import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react-native';
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
  icon?: ReactNode;
  iconColor?: string;
}) {
  const { colors, spacing, radius } = useAppTheme();
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
                borderRadius: radius.sm,
                backgroundColor: `${iconColor ?? '#17c06e'}14`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </View>
          ) : null}
          <AppText style={{ fontSize: 20, letterSpacing: -0.4 }} weight="black">
            {title}
          </AppText>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <AppText style={{ fontSize: 13 }} weight="bold" color="#17c06e">
              {actionLabel}
            </AppText>
            <ArrowRight size={14} color="#17c06e" />
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
