import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { GraduationCap, MapPin, Package, Star, Store, Tag } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';
import { AppImage } from './AppImage';
import type { IStore } from '@/types/store';
import type { ISchoolZone } from '@/types/zone';

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const CATEGORY_TINTS = [
  { bg: '#eff6ff', fg: '#2563eb', darkBg: 'rgba(96,165,250,0.14)', darkFg: '#60a5fa' },
  { bg: '#faf5ff', fg: '#9333ea', darkBg: 'rgba(192,132,252,0.14)', darkFg: '#c084fc' },
  { bg: '#fff1f2', fg: '#e11d48', darkBg: 'rgba(251,113,133,0.14)', darkFg: '#fb7185' },
  { bg: '#fffbeb', fg: '#d97706', darkBg: 'rgba(251,191,36,0.14)', darkFg: '#fbbf24' },
  { bg: '#ecfdf5', fg: '#059669', darkBg: 'rgba(52,211,153,0.14)', darkFg: '#34d399' },
  { bg: '#eef2ff', fg: '#4f46e5', darkBg: 'rgba(129,140,248,0.14)', darkFg: '#818cf8' },
  { bg: '#ecfeff', fg: '#0891b2', darkBg: 'rgba(34,211,238,0.14)', darkFg: '#22d3ee' },
  { bg: '#fff7ed', fg: '#ea580c', darkBg: 'rgba(251,146,60,0.14)', darkFg: '#fb923c' },
];

export function CategoryTile({
  name,
  count,
  index,
  onPress,
}: {
  name: string;
  count?: number;
  index: number;
  onPress?: () => void;
}) {
  const { radius } = useAppTheme();
  const isDark = useAppTheme().isDark;
  const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length];
  const bg = isDark ? tint.darkBg : tint.bg;
  const fg = isDark ? tint.darkFg : tint.fg;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '48.5%',
          height: 96,
          borderRadius: radius.sm,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Tag
        size={80}
        color={fg}
        fill={fg}
        opacity={0.1}
        style={{ position: 'absolute', right: -16, bottom: -16, transform: [{ rotate: '12deg' }] }}
      />
      <AppText style={{ fontSize: 18, paddingHorizontal: 8 }} weight="bold" color={fg} numberOfLines={1}>
        {name}
      </AppText>
      <AppText style={{ fontSize: 11, opacity: 0.7 }} color={fg}>
        {count ?? 0} Products
      </AppText>
    </Pressable>
  );
}

function CardShell({
  bannerUri,
  fallbackText,
  onPress,
  children,
}: {
  bannerUri?: string;
  fallbackText: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '100%',
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <AppImage
        uri={bannerUri}
        style={{ width: '100%', height: 64, borderRadius: 0 }}
        fallbackText={fallbackText}
      />
      <View style={{ padding: spacing.md, gap: 6 }}>{children}</View>
    </Pressable>
  );
}

export function ZoneCard({ zone }: { zone: ISchoolZone }) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const location = [zone.location, zone.state].filter(Boolean).join(', ');
  return (
    <CardShell
      bannerUri={zone.cover_image}
      fallbackText={zone.name}
      onPress={() =>
        router.push({ pathname: '/zone/[identifier]', params: { identifier: zone.slug ?? zone.id } })
      }
    >
      <AppText style={{ fontSize: 14 }} weight="bold" numberOfLines={1}>
        {zone.name}
      </AppText>
      {location ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} color={colors.primary} />
          <AppText style={{ fontSize: 11 }} color={colors.textMuted} numberOfLines={1}>
            {location}
          </AppText>
        </View>
      ) : null}
      <AppText style={{ fontSize: 12, lineHeight: 16 }} color={colors.textMuted} numberOfLines={2}>
        {zone.tagline ?? (zone.description ? zone.description : `Shop from ${zone.name} vendors...`)}
      </AppText>
      <View
        style={{
          marginTop: 8,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceAlt,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(23,192,110,0.06)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Store size={14} color={colors.primary} />
          <AppText style={{ fontSize: 11 }} weight="semibold" color={colors.text}>
            {formatCompact(zone.member_count ?? 0)}
          </AppText>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(23,192,110,0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <GraduationCap size={14} color={colors.primary} />
          <AppText style={{ fontSize: 11 }} weight="bold" color={colors.primary}>
            School Zone
          </AppText>
        </View>
      </View>
    </CardShell>
  );
}

export function StoreCard({ store }: { store: IStore }) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const address = (() => {
    const addr = store.address;
    if (!addr) return '';
    const parts = [addr.street, addr.city, addr.state].filter((p): p is string => !!p);
    return parts.slice(0, 2).join(', ');
  })();
  const rating = Number(store.rating_average ?? 0);
  return (
    <CardShell
      bannerUri={store.cover_image}
      fallbackText={store.store_name}
      onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.slug } })}
    >
      <AppText style={{ fontSize: 14 }} weight="bold" numberOfLines={1}>
        {store.store_name}
      </AppText>
      {address ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} color={colors.primary} />
          <AppText style={{ fontSize: 11 }} color={colors.textMuted} numberOfLines={1}>
            {address}
          </AppText>
        </View>
      ) : null}
      <AppText style={{ fontSize: 12, lineHeight: 16 }} color={colors.textMuted} numberOfLines={2}>
        {store.description ?? `Explore products from ${store.store_name}...`}
      </AppText>
      <View
        style={{
          marginTop: 8,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceAlt,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(23,192,110,0.06)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Package size={14} color={colors.primary} />
          <AppText style={{ fontSize: 11 }} weight="semibold" color={colors.text}>
            {formatCompact(store.total_products ?? 0)}
          </AppText>
        </View>
        {rating > 0 ? (
          <View
            style={{
              backgroundColor: 'rgba(245,158,11,0.1)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <AppText style={{ fontSize: 11 }} weight="bold" color="#b45309">
              {rating.toFixed(1)}
            </AppText>
          </View>
        ) : null}
      </View>
    </CardShell>
  );
}
