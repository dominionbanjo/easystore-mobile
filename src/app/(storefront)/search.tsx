import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  GraduationCap,
  LayoutGrid,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ZoneCard } from '@/components/shared/Cards';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useAppTheme } from '@/theme';
import { useGetFeaturedProductsQuery, useSearchProductsQuery } from '@/api/productApi';
import { useGetZonesQuery } from '@/api/zoneApi';
import type { IProduct } from '@/types/product';

type DiscoveryPath = {
  title: string;
  subtext: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  href: string;
  isNew?: boolean;
};

const DISCOVERY_PATHS: DiscoveryPath[] = [
  { title: 'Trending', subtext: 'Popular items this week', icon: TrendingUp, color: '#f97316', href: '/products?mode=trending' },
  { title: 'New Arrivals', subtext: 'Freshly added products', icon: Zap, color: '#3b82f6', href: '/products' },
  { title: 'Featured', subtext: "Editor's top picks", icon: Sparkles, color: '#a855f7', href: '/products?mode=featured' },
  { title: 'School Zones', subtext: 'Campus marketplaces near you', icon: GraduationCap, color: '#06b6d4', href: '/products?mode=zones', isNew: true },
  { title: 'Top Stores', subtext: 'Best sellers in Nigeria', icon: Sparkles, color: '#10b981', href: '/products?mode=stores' },
];

function DiscoverySectionHeader({
  icon,
  iconColor,
  title,
  subtitle,
  onViewAll,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  onViewAll: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginBottom: 12, gap: 6 }}>
      <Row style={{ gap: 8 }}>
        {icon}
        <AppText style={{ fontSize: 20, letterSpacing: -0.4 }} weight="black">
          {title}
        </AppText>
      </Row>
      <AppText variant="small" color={colors.textMuted} style={{ maxWidth: 480 }}>
        {subtitle}
      </AppText>
      <Pressable onPress={onViewAll} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
        <AppText style={{ fontSize: 15 }} weight="bold" color="#17c06e">
          View All
        </AppText>
        <ArrowRight size={16} color="#17c06e" />
      </Pressable>
    </View>
  );
}

function ProductSection({
  title,
  icon,
  iconColor,
  subtitle,
  onViewAll,
  products,
  loading,
  limit = 4,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  subtitle: string;
  onViewAll: () => void;
  products?: IProduct[] | null;
  loading?: boolean;
  limit?: number;
}) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <DiscoverySectionHeader icon={icon} iconColor={iconColor} title={title} subtitle={subtitle} onViewAll={onViewAll} />
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products && products.length > 0 ? (
        <ProductGrid products={products.slice(0, limit)} />
      ) : null}
    </View>
  );
}

export default function DiscoverScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  useEffect(() => {
    setIsDiscoveryOpen(true);
  }, []);

  const featured = useGetFeaturedProductsQuery();
  const trending = useSearchProductsQuery({ sort: 'rating_desc', limit: 4 });
  const newArrivals = useSearchProductsQuery({ sort: 'date_desc', limit: 4 });
  const zones = useGetZonesQuery({ limit: 4 });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/products', params: { q: searchQuery.trim() } });
    }
  };

  return (
    <Screen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ─── HERO ─── */}
        <View style={{ position: 'relative', paddingTop: spacing.lg, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}>
          <LinearGradient
            colors={['rgba(23,192,110,0.10)', 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 240 }}
          />
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Row style={{ backgroundColor: 'rgba(23,192,110,0.05)', borderWidth: 1, borderColor: 'rgba(23,192,110,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, gap: 6 }}>
              <Sparkles size={14} color="#17c06e" />
              <AppText style={{ fontSize: 11, fontWeight: '700' }} color="#17c06e">
                Curated Selection
              </AppText>
            </Row>
            <AppText style={{ fontSize: 26, letterSpacing: -0.5, textAlign: 'center' }} weight="black">
              Discover{' '}
              <AppText style={{ fontSize: 26, letterSpacing: -0.5 }} weight="black" color="#17c06e">
                Something New
              </AppText>
            </AppText>
            <View style={{ width: '100%', maxWidth: 576, position: 'relative' }}>
              <AppInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for anything..."
                icon={<Search size={16} color={colors.textSubtle} />}
                autoCapitalize="none"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                style={{ paddingRight: 56 }}
              />
              <Pressable
                onPress={handleSearch}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  width: 36,
                  height: 36,
                  borderRadius: 5,
                  backgroundColor: '#17c06e',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search size={16} color="#ffffff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── EXPLORE PATH TRIGGER ─── */}
        <View style={{ paddingHorizontal: spacing.lg, alignItems: 'center' }}>
          <Pressable
            onPress={() => setIsDiscoveryOpen(true)}
            style={({ pressed }) => [
              {
                width: '100%',
                maxWidth: 480,
                height: 48,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 5,
                paddingHorizontal: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Row style={{ gap: spacing.md }}>
              <View style={{ padding: 8, borderRadius: 5, backgroundColor: 'rgba(23,192,110,0.1)' }}>
                <LayoutGrid size={20} color="#17c06e" />
              </View>
              <View>
                <AppText style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }} color={colors.textMuted}>
                  Explore Path
                </AppText>
                <AppText style={{ fontSize: 15 }} weight="black">
                  Choose Discovery
                </AppText>
              </View>
            </Row>
            <View style={{ padding: 4, borderRadius: 4, backgroundColor: colors.surfaceAlt }}>
              <ArrowRight size={16} color={colors.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
          </Pressable>
        </View>

        <Spacer height={spacing.xl} />

        {/* ─── SCHOOL ZONES ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <DiscoverySectionHeader
            icon={<GraduationCap size={20} color="#06b6d4" />}
            iconColor="#06b6d4"
            title="School Zones"
            subtitle="Campus marketplaces with verified vendors for your school community."
            onViewAll={() => router.push('/products?mode=zones')}
          />
          {zones.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : zones.data && zones.data.items.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
              {zones.data.items.slice(0, 4).map((zone) => (
                <View key={zone.id} style={{ width: '48.5%' }}>
                  <ZoneCard zone={zone} />
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Spacer height={spacing.md} />

        {/* ─── FEATURED ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ProductSection
            title="Featured"
            icon={<Sparkles size={20} color="#17c06e" />}
            iconColor="#17c06e"
            subtitle="Our top handpicked premium selections across all categories, updated daily."
            onViewAll={() => router.push('/products?mode=featured')}
            products={featured.data}
            loading={featured.isLoading}
          />
        </View>

        {/* ─── TRENDING NOW ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ProductSection
            title="Trending Now"
            icon={<TrendingUp size={20} color="#f97316" />}
            iconColor="#f97316"
            subtitle="See what everyone is talking about. These are the most popular products right now."
            onViewAll={() => router.push('/products?mode=trending')}
            products={trending.data?.items}
            loading={trending.isLoading}
          />
        </View>

        {/* ─── NEW ARRIVALS ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ProductSection
            title="New Arrivals"
            icon={<Zap size={20} color="#3b82f6" />}
            iconColor="#3b82f6"
            subtitle="Fresh from our vendors. Be the first to discover and own the latest additions."
            onViewAll={() => router.push('/products')}
            products={newArrivals.data?.items}
            loading={newArrivals.isLoading}
          />
        </View>
      </ScrollView>

      {/* ─── CHOOSE DISCOVERY PATH MODAL ─── */}
      <AppModal
        visible={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        title="Choose Discovery Path"
        description="Select your preferred way to explore our collections."
      >
        <View style={{ gap: 4 }}>
          {DISCOVERY_PATHS.map((link) => (
            <Pressable
              key={link.title}
              onPress={() => {
                setIsDiscoveryOpen(false);
                router.push(link.href as never);
              }}
              style={({ pressed }) => [
                {
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  borderWidth: 1,
                  borderColor: 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={{ padding: 12, borderRadius: 5, backgroundColor: `${link.color}14` }}>
                <link.icon size={22} color={link.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 16, letterSpacing: -0.3 }} weight="black">
                  {link.title}
                </AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {link.subtext}
                </AppText>
              </View>
              {link.isNew ? (
                <View style={{ backgroundColor: '#17c06e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 }}>
                  <AppText style={{ fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }} color="#ffffff">
                    New
                  </AppText>
                </View>
              ) : (
                <ArrowRight size={20} color="#17c06e" />
              )}
            </Pressable>
          ))}
        </View>
      </AppModal>
    </Screen>
  );
}
