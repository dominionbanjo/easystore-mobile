import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '../../theme';
import { AppText } from './Text';
import { Card } from './Card';

export function StatsCard({
  label,
  value,
  icon,
  iconColor = 'primary',
  trend,
  trendDirection = 'up',
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  iconColor?: 'primary' | 'blue' | 'orange' | 'green' | 'emerald';
  trend?: string;
  trendDirection?: 'up' | 'down';
}) {
  const { colors, spacing } = useAppTheme();
  const iconPalettes: Record<string, { bg: string; fg: string; border: string }> = {
    primary: {
      bg: `${colors.primary}1a`,
      fg: colors.primary,
      border: `${colors.primary}33`,
    },
    blue: { bg: 'rgba(59,130,246,0.1)', fg: '#2563eb', border: 'rgba(59,130,246,0.2)' },
    orange: { bg: 'rgba(249,115,22,0.1)', fg: '#ea580c', border: 'rgba(249,115,22,0.2)' },
    green: { bg: 'rgba(16,185,129,0.1)', fg: '#059669', border: 'rgba(16,185,129,0.2)' },
    emerald: { bg: 'rgba(16,185,129,0.1)', fg: '#059669', border: 'rgba(16,185,129,0.2)' },
  };
  const palette = iconPalettes[iconColor];
  const compact = value.length > 12;

  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText
            style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}
            weight="bold"
            color={colors.textMuted}
          >
            {label}
          </AppText>
          <AppText
            style={{ fontSize: compact ? 16 : 20 }}
            weight="extrabold"
            color={colors.text}
          >
            {value}
          </AppText>
          {trend ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 4,
                  backgroundColor: trendDirection === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                }}
              >
                <AppText
                  style={{ fontSize: 10 }}
                  weight="bold"
                  color={trendDirection === 'up' ? '#059669' : '#e11d48'}
                >
                  {trendDirection === 'up' ? '+' : '−'}
                  {trend}
                </AppText>
              </View>
              <AppText style={{ fontSize: 11 }} color={colors.textMuted}>
                vs last month
              </AppText>
            </View>
          ) : null}
        </View>
        {icon ? (
          <View
            style={{
              padding: 8,
              borderRadius: 4,
              borderWidth: 1,
              backgroundColor: palette.bg,
              borderColor: palette.border,
            }}
          >
            {icon}
          </View>
        ) : null}
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: palette.bg }}>
        <View style={{ height: '100%', width: '40%', borderRadius: 2, backgroundColor: palette.fg }} />
      </View>
    </Card>
  );
}

export function StatsGrid({
  items,
  columns = 2,
}: {
  items: {
    label: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
    iconColor?: 'primary' | 'blue' | 'orange' | 'green' | 'emerald';
  }[];
  columns?: number;
}) {
  const { spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
      }}
    >
      {items.map((item) => (
        <View key={item.label} style={{ width: `${100 / columns - 4}%` }}>
          <StatsCard {...item} />
        </View>
      ))}
    </View>
  );
}
