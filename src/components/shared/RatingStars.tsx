import { View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';

export function RatingStars({
  rating,
  size = 14,
  showValue = true,
}: {
  rating?: string | number;
  size?: number;
  showValue?: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  const numericRating = Number(rating ?? 0);
  const fullStars = Math.round(numericRating);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AppText
            key={star}
            style={{ fontSize: size, lineHeight: size + 2 }}
            color={star <= fullStars ? '#f59e0b' : colors.border}
          >
            ★
          </AppText>
        ))}
      </View>
      {showValue && numericRating > 0 ? (
        <AppText variant="small" color={colors.textMuted}>
          {numericRating.toFixed(1)}
        </AppText>
      ) : null}
    </View>
  );
}
