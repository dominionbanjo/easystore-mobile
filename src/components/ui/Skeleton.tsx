import { View } from 'react-native';
import { useAppTheme } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Skeleton height={height} borderRadius={12} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="50%" height={14} />
    </View>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

export function ProductCardSkeleton() {
  const { spacing } = useAppTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Skeleton height={160} borderRadius={12} />
      <Skeleton width="90%" height={14} />
      <Skeleton width="60%" height={14} />
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ width: '47%', gap: spacing.sm }}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}
