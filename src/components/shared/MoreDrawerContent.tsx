import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';

export interface MoreDrawerRow {
  label: string;
  icon: ReactNode;
  href: string;
  permission?: string;
}

interface MoreDrawerContentProps {
  rows: MoreDrawerRow[];
  hasPermission?: (permission?: string) => boolean;
  onNavigate: (href: string) => void;
  /** Rendered above the rows (e.g. store switcher). */
  children?: ReactNode;
  /** Rendered below the rows (e.g. logout). */
  footer?: ReactNode;
}

/** Shared drawer body — mirrors web `DashboardBottomNav` drawer rows (icon tile + label, active highlight). */
export function MoreDrawerContent({
  rows,
  hasPermission,
  onNavigate,
  children,
  footer,
}: MoreDrawerContentProps) {
  const { colors, spacing, radius } = useAppTheme();
  const pathname = usePathname();

  const visibleRows = hasPermission ? rows.filter((row) => hasPermission(row.permission)) : rows;

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <View style={{ flex: 1 }}>
      {children ? (
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>{children}</View>
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, gap: spacing.xs }}>
        {visibleRows.map((row) => {
          const active = isActive(row.href);
          return (
            <Pressable
              key={row.label}
              onPress={() => onNavigate(row.href)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.sm,
                  backgroundColor: active ? colors.surfaceAlt : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  backgroundColor: active ? colors.primaryMuted : colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row.icon}
              </View>
              <AppText
                variant="label"
                weight={active ? 'bold' : 'medium'}
                color={active ? colors.primary : colors.text}
                style={{ flex: 1 }}
              >
                {row.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      {footer ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.lg }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
