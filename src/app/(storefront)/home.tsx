import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  Sparkles,
  Store,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { Messages3 } from 'iconsax-react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Logo } from '@/components/shared/Logo';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ProductGrid, ProductRail } from '@/components/shared/ProductCard';
import { AppImage } from '@/components/shared/AppImage';
import { CategoryTile, StoreCard, ZoneCard } from '@/components/shared/Cards';
import { TrustedByMarquee } from '@/components/shared/TrustedByMarquee';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppTheme } from '@/theme';
import { useGetFeaturedProductsQuery, useGetProductsQuery, useSearchProductsQuery } from '@/api/productApi';
import { useGetTrendingStoresQuery } from '@/api/storeApi';
import { useGetZonesQuery } from '@/api/zoneApi';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { useGetForYouQuery, useGetTrendingRecommendationsQuery } from '@/api/recommendationApi';
import { useAppSelector } from '@/hooks';
import { useGetConversationsQuery } from '@/api/messagingApi';
import type { IProduct } from '@/types/product';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1200&q=60';

const BAND_LIGHT = 'rgba(248,250,252,0.5)';
const BAND_DARK = 'rgba(23,23,23,0.4)';
const MUTED_LIGHT = 'rgba(228,228,231,0.18)';
const MUTED_DARK = 'rgba(38,38,38,0.4)';
const EMPTY_LIGHT = 'rgba(228,228,231,0.15)';
const EMPTY_DARK = 'rgba(38,38,38,0.5)';

function SectionGrid({
  title,
  subtitle,
  actionLabel,
  onAction,
  products,
  loading,
  tinted = false,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  products?: IProduct[] | { items?: IProduct[] } | null;
  loading?: boolean;
  tinted?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const { spacing, isDark } = useAppTheme();
  const band = isDark ? BAND_DARK : BAND_LIGHT;
  const emptyBg = isDark ? EMPTY_DARK : EMPTY_LIGHT;
  const list = Array.isArray(products) ? products : (products?.items ?? []);
  if (loading) {
    return (
      <View
        style={[
          { paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, marginHorizontal: -spacing.lg },
          tinted && { backgroundColor: band },
        ]}
      >
        <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} onAction={onAction} />
        <ProductGridSkeleton count={4} />
      </View>
    );
  }
  return (
    <View
      style={[
        { paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, marginHorizontal: -spacing.lg },
        tinted && { backgroundColor: band },
      ]}
    >
      <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} onAction={onAction} />
      {list.length > 0 ? (
        <ProductGrid products={list.slice(0, 8)} />
      ) : emptyTitle ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          style={{ backgroundColor: emptyBg, borderRadius: 5 }}
        />
      ) : null}
    </View>
  );
}

function HeroCarouselSkeleton() {
  const { spacing, colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = width - spacing.lg * 2;
  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View
        style={{
          width: cardWidth,
          height: 300,
          borderRadius: 5,
          overflow: 'hidden',
          backgroundColor: colors.surfaceAlt,
          justifyContent: 'flex-end',
          padding: 20,
          gap: 10,
        }}
      >
        <Skeleton width={110} height={20} borderRadius={5} />
        <Skeleton width="70%" height={22} />
        <Skeleton width="45%" height={18} />
      </View>
    </View>
  );
}

function HeroCarousel({ products }: { products: IProduct[] }) {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = width - spacing.lg * 2;
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = products.length;

  useEffect(() => {
    if (count <= 1) {
      return;
    }
    timerRef.current = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % count;
        scrollRef.current?.scrollTo({ x: next * cardWidth, animated: true });
        return next;
      });
    }, 5000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [count, cardWidth]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setIndex(Math.max(0, Math.min(next, count - 1)));
  };

  if (count === 0) {
    return null;
  }

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(target, count - 1));
    scrollRef.current?.scrollTo({ x: clamped * cardWidth, animated: true });
    setIndex(clamped);
  };

  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <View style={{ borderRadius: 5, overflow: 'hidden' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() =>
                router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })
              }
              style={{ width: cardWidth, height: 300 }}
            >
              <AppImage
                uri={product.image ?? FALLBACK_IMAGE}
                style={{ width: '100%', height: '100%', borderRadius: 0 }}
                fallbackText={product.name}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.10)']}
                locations={[0, 0.5, 1]}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: 20,
                  gap: 10,
                }}
              >
                <Row style={{ alignSelf: 'flex-start', backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, gap: 5 }}>
                  <Flame size={13} color="#ffffff" />
                  <AppText style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }} color="#ffffff">
                    Deal of the Day
                  </AppText>
                </Row>
                <AppText numberOfLines={2} style={{ fontSize: 20, letterSpacing: -0.5, fontWeight: '900', color: '#ffffff' }}>
                  {product.name}
                </AppText>
                <Row style={{ gap: 12, alignItems: 'baseline' }}>
                  {product.discount_price ? (
                    <AppText style={{ fontSize: 14, textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.7)' }}>
                      ₦{Number(product.price).toLocaleString('en-NG')}
                    </AppText>
                  ) : null}
                  <AppText style={{ fontSize: 20, fontWeight: '900', color: '#34d399' }}>
                    ₦{Number(product.discount_price ?? product.price).toLocaleString('en-NG')}
                  </AppText>
                </Row>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })
                  }
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#17c06e',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AppText style={{ fontSize: 14, fontWeight: '900', color: '#ffffff' }}>
                    Shop Now
                  </AppText>
                  <ChevronRight size={16} color="#ffffff" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {count > 1 ? (
          <>
            {index > 0 ? (
              <Pressable
                onPress={() => goTo(index - 1)}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '45%',
                  width: 36,
                  height: 36,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} color="#ffffff" />
              </Pressable>
            ) : null}
            {index < count - 1 ? (
              <Pressable
                onPress={() => goTo(index + 1)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '45%',
                  width: 36,
                  height: 36,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={20} color="#ffffff" />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>
      {count > 1 ? (
        <Row style={{ justifyContent: 'center', gap: 6, paddingTop: spacing.md }}>
          {products.map((product, dotIndex) => (
            <View
              key={product.id}
              style={{
                width: dotIndex === index ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: dotIndex === index ? '#17c06e' : colors.border,
              }}
            />
          ))}
        </Row>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const { colors, spacing, isDark } = useAppTheme();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const { data: conversations } = useGetConversationsQuery(undefined, { skip: !isAuthenticated });
  const unreadCount = conversations?.reduce(
    (total, conversation) => total + (conversation.unread_count ?? 0),
    0,
  ) ?? 0;

  const forYou = useGetForYouQuery(undefined, { skip: !isAuthenticated });
  const trending = useGetTrendingRecommendationsQuery();
  const deals = useSearchProductsQuery({ onSale: true, limit: 10, sort: 'date_desc' });
  const featured = useGetFeaturedProductsQuery();
  const allProducts = useGetProductsQuery({ limit: 20 });
  const stores = useGetTrendingStoresQuery({ limit: 12 });
  const zones = useGetZonesQuery({ limit: 12 });
  const categories = useGetCategoriesQuery();

  const heroProducts = deals.data?.items ?? allProducts.data?.items?.slice(0, 4) ?? [];
  const heroLoading = heroProducts.length === 0 && (deals.isLoading || allProducts.isLoading);
  const topCategories = categories.data?.slice(0, 8) ?? [];

  const quickLinks = [
    { label: 'Trending', icon: TrendingUp, bg: '#f97316', href: '/products?mode=trending' },
    { label: 'New Arrivals', icon: Zap, bg: '#3b82f6', href: '/products' },
    { label: 'Featured', icon: Sparkles, bg: '#a855f7', href: '/products?mode=featured' },
    { label: 'Top Stores', icon: Store, bg: '#10b981', href: '/products?mode=stores' },
  ];

  const forYouTitle = isAuthenticated && forYou.data && forYou.data.length > 0 ? 'Recommended for You' : 'Trending Now';
  const forYouSubtitle =
    isAuthenticated && forYou.data && forYou.data.length > 0
      ? 'Picked for you from your preferences, purchases, wishlist and cart.'
      : 'What shoppers are loving right now — sign in and pick your interests for personalised picks.';
  const forYouProducts = isAuthenticated ? forYou.data : trending.data;
  const forYouLoading = isAuthenticated ? forYou.isLoading : trending.isLoading;

  return (
    <Screen scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ─── HEADER (web mobile header: logo + search + messages + profile) ─── */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Logo size="lg" />
          <Row style={{ gap: spacing.sm }}>
            <Pressable onPress={() => router.push('/search')} hitSlop={8} style={{ padding: 8 }}>
              <Search size={20} color={colors.text} strokeWidth={2} />
            </Pressable>
            <Pressable onPress={() => router.push('/messages')} hitSlop={8} style={{ padding: 8 }}>
              <Messages3
                variant={(unreadCount ?? 0) > 0 ? 'Bold' : 'Linear'}
                size={20}
                color={(unreadCount ?? 0) > 0 ? '#17c06e' : colors.text}
              />
              {(unreadCount ?? 0) > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 5,
                    backgroundColor: '#ef4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                    borderWidth: 2,
                    borderColor: colors.surface,
                  }}
                >
                  <AppText style={{ fontSize: 9, fontWeight: '900' }} color="#ffffff">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
            <Pressable onPress={() => router.push('/account')} hitSlop={8} style={{ padding: 8 }}>
              {user?.avatar ? (
                <View style={{ width: 32, height: 32, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                  <AppImage uri={user.avatar} style={{ width: '100%', height: '100%', borderRadius: 0 }} fallbackText="" />
                </View>
              ) : (
                <View style={{ width: 32, height: 32, borderRadius: 5, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText style={{ fontSize: 14, fontWeight: '700' }} color={colors.textMuted}>
                    {user ? `${user.first_name[0]}${user.last_name[0]}` : 'U'}
                  </AppText>
                </View>
              )}
            </Pressable>
          </Row>
        </View>

        {/* ─── HERO: DEALS CAROUSEL ─── */}
        {heroLoading ? <HeroCarouselSkeleton /> : <HeroCarousel products={heroProducts} />}
        <Spacer height={16} />

        {/* ─── CATEGORY PILLS (mobile only, web hero) ─── */}
        {topCategories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
            {topCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() =>
                  router.push({ pathname: '/category/[slug]', params: { slug: category.slug ?? category.id } })
                }
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <AppText variant="label" weight="medium" color={colors.textMuted}>
                  {category.name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {/* ─── QUICK LINKS STRIP ─── */}
        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
            {quickLinks.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => router.push(link.href as never)}
                style={({ pressed }) => [
                  {
                    width: '48.5%',
                    height: 60,
                    borderRadius: 5,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 5,
                    backgroundColor: link.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <link.icon size={18} color="#ffffff" strokeWidth={2} />
                </View>
                <AppText style={{ fontSize: 14 }} weight="bold">
                  {link.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── FOR YOU / TRENDING ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title={forYouTitle}
            subtitle={forYouSubtitle}
            actionLabel="View All"
            onAction={() => router.push('/products')}
            products={forYouProducts}
            loading={forYouLoading}
            emptyTitle="Nothing to show yet"
            emptyDescription="New recommendations are on the way. Check back soon!"
          />
        </View>

        {/* ─── DEALS OF THE DAY (horizontal rail w-210) ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionHeader
            title="Deals of the Day"
            subtitle="Unmissable discounts — grab them before they are gone."
            actionLabel="View All"
            onAction={() => router.push('/products?mode=deals')}
            icon={<Flame size={20} color="#ef4444" />}
            iconColor="#ef4444"
          />
          {deals.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : deals.data && deals.data.items.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row style={{ gap: spacing.md }}>
                <ProductRail products={deals.data.items.slice(0, 10)} width={210} />
              </Row>
            </ScrollView>
          ) : (
            <EmptyState
              title="No deals right now"
              description="Vendors are cooking up new discounts — check back soon!"
              style={{ backgroundColor: isDark ? EMPTY_DARK : EMPTY_LIGHT, borderRadius: 5 }}
            />
          )}
        </View>

        {/* ─── TRENDING NOW ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="Trending Now"
            subtitle="The fastest-moving products across eazystore this week."
            actionLabel="View All"
            onAction={() => router.push('/products?mode=trending')}
            products={trending.data}
            loading={trending.isLoading}
            emptyTitle="No trending items yet"
            emptyDescription="Popular products will appear here as shoppers engage."
          />
        </View>

        {/* ─── SCHOOL ZONES (grey band + ZoneCard grid) ─── */}
        {zones.data && zones.data.items.length > 0 ? (
          <View style={{ paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, backgroundColor: isDark ? BAND_DARK : BAND_LIGHT }}>
            <SectionHeader
              title="School Zones"
              subtitle="Campus marketplaces with verified vendors for your school community."
              actionLabel="View All Zones"
              onAction={() => router.push('/products?mode=zones')}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
              {zones.data.items.slice(0, 8).map((zone) => (
                <View key={zone.id} style={{ width: '48.5%' }}>
                  <ZoneCard zone={zone} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ─── BROWSE BY CATEGORY (colored tiles) ─── */}
        {topCategories.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <SectionHeader
              title="Browse by Category"
              subtitle="Explore our wide range of collections and find exactly what you need."
              actionLabel="View All Categories"
              onAction={() => router.push('/products')}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
              {topCategories.map((category, index) => (
                <CategoryTile
                  key={category.id}
                  name={category.name}
                  count={category.products_count}
                  index={index}
                  onPress={() =>
                    router.push({ pathname: '/category/[slug]', params: { slug: category.slug ?? category.id } })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* ─── FEATURED DEALS (muted band) ─── */}
        <View style={{ backgroundColor: isDark ? MUTED_DARK : MUTED_LIGHT, paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="Featured Deals"
            subtitle="Handpicked premium selection from our top-rated vendors. Quality meets affordability."
            actionLabel="Discover More"
            onAction={() => router.push('/products?mode=featured')}
            products={featured.data}
            loading={featured.isLoading}
            emptyTitle="New Deals Coming Soon"
            emptyDescription="We're currently scouting for the best products to feature here. Keep an eye out!"
          />
        </View>

        {/* ─── TRENDING STORES (grey band + StoreCard grid) ─── */}
        {stores.data && stores.data.items.length > 0 ? (
          <View style={{ paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, backgroundColor: isDark ? BAND_DARK : BAND_LIGHT }}>
            <SectionHeader
              title="Trending Stores"
              subtitle="Discover top-rated sellers with exceptional products and service."
              actionLabel="View All Stores"
              onAction={() => router.push('/products?mode=stores')}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
              {stores.data.items.slice(0, 8).map((store) => (
                <View key={store.id} style={{ width: '48.5%' }}>
                  <StoreCard store={store} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ─── MARKETPLACE COLLECTIVE ─── */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="Marketplace Collective"
            subtitle="Explore thousands of unique products from verified local businesses. Everything you need, all in one place."
            products={allProducts.data?.items}
            loading={allProducts.isLoading}
            emptyTitle="Marketplace is Quiet"
            emptyDescription="We don't have any products available right now. We're stocking up, so come back soon!"
          />
          {allProducts.data && allProducts.data.items.length > 0 ? (
            <Pressable
              onPress={() => router.push('/products')}
              style={{
                alignSelf: 'center',
                backgroundColor: '#17c06e',
                paddingHorizontal: 28,
                paddingVertical: 12,
                borderRadius: 5,
              }}
            >
              <AppText
                style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }}
                color="#ffffff"
              >
                See More Products
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {/* ─── TRUSTED BY (auto-scroll marquee) ─── */}
        <View style={{ marginTop: spacing.xl, backgroundColor: isDark ? MUTED_DARK : 'rgba(228,228,231,0.15)' }}>
          <TrustedByMarquee stores={stores.data?.items ?? []} />
        </View>
      </ScrollView>
    </Screen>
  );
}
