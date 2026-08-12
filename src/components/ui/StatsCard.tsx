import { View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';
import { Card } from './Card';

export function StatsCard({
  label,
  value,
  sublabel,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <Card
      style={{
        flex: 1,
        gap: spacing.xs,
        backgroundColor: accent ? colors.primary : colors.surface,
        borderColor: accent ? colors.primary : colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText
          variant="small"
          weight="medium"
          color={accent ? colors.primaryForeground : colors.textMuted}
        >
          {label}
        </AppText>
        {icon}
      </View>
      <AppText
        variant="title"
        weight="bold"
        color={accent ? colors.primaryForeground : colors.text}
      >
        {value}
      </AppText>
      {sublabel ? (
        <AppText
          variant="small"
          color={accent ? colors.primaryForeground : colors.textSubtle}
        >
          {sublabel}
        </AppText>
      ) : null}
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
    sublabel?: string;
    accent?: boolean;
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
