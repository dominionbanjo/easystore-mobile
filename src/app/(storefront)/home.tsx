import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Logo } from '@/components/shared/Logo';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ProductGrid, ProductRail } from '@/components/shared/ProductCard';
import { AppImage } from '@/components/shared/AppImage';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { formatNGN } from '@/utils/money';
import { useAppTheme } from '@/theme';
import { useGetFeaturedProductsQuery, useGetProductsQuery , useSearchProductsQuery } from '@/api/productApi';
import { useGetTrendingStoresQuery } from '@/api/storeApi';
import { useGetZonesQuery } from '@/api/zoneApi';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { useGetForYouQuery, useGetTrendingRecommendationsQuery } from '@/api/recommendationApi';
import { useAppSelector } from '@/hooks';
import { useGetCartQuery } from '@/api/cartApi';
import { selectGuestCart } from '@/features/cartSlice';
import type { IProduct } from '@/types/product';

function SectionGrid({
  title,
  subtitle,
  actionLabel,
  onAction,
  products,
  loading,
  tinted = false,
  showSkeleton = true,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  products?: IProduct[];
  loading?: boolean;
  tinted?: boolean;
  showSkeleton?: boolean;
}) {
  const { spacing } = useAppTheme();
  if (loading && showSkeleton) {
    return <ProductGridSkeleton count={4} />;
  }
  if (!products || products.length === 0) {
    return null;
  }
  return (
    <View
      style={[
        { paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, marginHorizontal: -spacing.lg },
        tinted && { backgroundColor: 'rgba(248,250,252,0.6)' },
      ]}
    >
      <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} onAction={onAction} />
      <ProductGrid products={products.slice(0, 4)} />
    </View>
  );
}

export default function HomeScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const guestCart = useAppSelector(selectGuestCart);
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const cartCount = isAuthenticated ? (serverCart?.items.length ?? 0) : guestCart.items.length;

  const forYou = useGetForYouQuery(undefined, { skip: !isAuthenticated });
  const trending = useGetTrendingRecommendationsQuery();
  const deals = useSearchProductsQuery({ onSale: true, limit: 20, sort: 'date_desc' });
  const featured = useGetFeaturedProductsQuery();
  const allProducts = useGetProductsQuery({ limit: 20 });
  const stores = useGetTrendingStoresQuery({ limit: 5 });
  const zones = useGetZonesQuery({ limit: 5 });
  const categories = useGetCategoriesQuery();

  const heroProducts = deals.data?.items ?? allProducts.data?.items?.slice(0, 4) ?? [];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (heroProducts.length <= 1) {
      return;
    }
    heroTimer.current = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroProducts.length);
    }, 5000);
    return () => {
      if (heroTimer.current) {
        clearInterval(heroTimer.current);
      }
    };
  }, [heroProducts.length]);

  const topCategories = categories.data?.slice(0, 10) ?? [];
  const hero = heroProducts[heroIndex % Math.max(heroProducts.length, 1)];

  const quickLinks = [
    { label: 'Trending', icon: 'trending-up', bg: '#f97316', href: '/products?mode=new' },
    { label: 'New Arrivals', icon: 'flash', bg: '#3b82f6', href: '/products' },
    { label: 'Featured', icon: 'sparkles', bg: '#a855f7', href: '/products?mode=featured' },
    { label: 'Top Stores', icon: 'storefront', bg: '#10b981', href: '/products?mode=stores' },
  ];

  return (
    <Screen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
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
          <Row style={{ gap: spacing.md }}>
            <Pressable onPress={() => router.push('/messages')} hitSlop={8}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('/cart')} hitSlop={8}>
              <Ionicons name="bag-handle-outline" size={24} color={colors.text} />
              {cartCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: '#17c06e',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                  }}
                >
                  <AppText style={{ fontSize: 9, fontWeight: '900' }} color="#ffffff">
                    {cartCount > 9 ? '9+' : cartCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          </Row>
        </View>

        {hero ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <View style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
              <AppImage
                uri={hero.image}
                style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 0 }}
                fallbackText={hero.name}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: spacing.lg,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  gap: spacing.sm,
                }}
              >
                <Row
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#ef4444',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 4,
                    gap: 4,
                  }}
                >
                  <Ionicons name="flame" size={11} color="#ffffff" />
                  <AppText style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }} color="#ffffff">
                    Deal of the Day
                  </AppText>
                </Row>
                <AppText
                  numberOfLines={2}
                  style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}
                >
                  {hero.name}
                </AppText>
                <Row style={{ gap: spacing.md, alignItems: 'baseline' }}>
                  {hero.discount_price ? (
                    <AppText style={{ fontSize: 13, textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.7)' }}>
                      {formatNGN(hero.price)}
                    </AppText>
                  ) : null}
                  <AppText style={{ fontSize: 18, fontWeight: '900', color: '#34d399' }}>
                    {formatNGN(hero.discount_price ?? hero.price)}
                  </AppText>
                </Row>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/product/[slug]', params: { slug: hero.slug } })
                  }
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#17c06e',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AppText style={{ fontSize: 13, fontWeight: '900', color: '#ffffff' }}>
                    Shop Now
                  </AppText>
                  <Ionicons name="chevron-forward" size={14} color="#ffffff" />
                </Pressable>
              </View>
            </View>
            {heroProducts.length > 1 ? (
              <Row style={{ justifyContent: 'center', gap: 6, paddingTop: spacing.md }}>
                {heroProducts.slice(0, 5).map((product, index) => (
                  <View
                    key={product.id}
                    style={{
                      width: index === heroIndex ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: index === heroIndex ? '#17c06e' : colors.border,
                    }}
                  />
                ))}
              </Row>
            ) : null}
          </View>
        ) : null}

        {topCategories.length > 0 ? (
          <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row style={{ gap: spacing.sm }}>
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
              </Row>
            </ScrollView>
          </View>
        ) : null}

        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {quickLinks.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => router.push(link.href as never)}
                style={({ pressed }) => [
                  {
                    width: '47%',
                    height: 60,
                    borderRadius: 4,
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
                    borderRadius: 4,
                    backgroundColor: link.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={link.icon as never} size={18} color="#ffffff" />
                </View>
                <AppText style={{ fontSize: 13 }} weight="bold">
                  {link.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="For You"
            subtitle="Personalized picks based on your interests"
            actionLabel="View All"
            onAction={() => router.push('/products?mode=featured')}
            products={forYou.data}
            loading={forYou.isLoading && isAuthenticated}
            showSkeleton={isAuthenticated}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionHeader
            title="Deals of the Day"
            subtitle="Unmissable discounts — grab them before they are gone."
            actionLabel="View All"
            onAction={() => router.push('/products?mode=deals')}
            icon="flame"
            iconColor="#ef4444"
          />
          {deals.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : deals.data && deals.data.items.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row style={{ gap: spacing.md }}>
                <ProductRail products={deals.data.items.slice(0, 8)} width={210} />
              </Row>
            </ScrollView>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="Trending Now"
            subtitle="What everyone is shopping right now"
            actionLabel="View All"
            onAction={() => router.push('/products')}
            products={trending.data}
            loading={trending.isLoading}
          />
        </View>

        {zones.data && zones.data.items.length > 0 ? (
          <View style={{ paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, marginHorizontal: -spacing.lg, backgroundColor: 'rgba(248,250,252,0.6)' }}>
            <SectionHeader
              title="School Zones"
              subtitle="University community marketplaces"
              actionLabel="View All Zones"
              onAction={() => router.push('/products?mode=zones')}
            />
            <View style={{ gap: spacing.md }}>
              {zones.data.items.slice(0, 4).map((zone) => (
                <Card
                  key={zone.id}
                  onPress={() =>
                    router.push({ pathname: '/zone/[identifier]', params: { identifier: zone.slug ?? zone.id } })
                  }
                  style={{ gap: spacing.sm }}
                >
                  <Row style={{ gap: spacing.md }}>
                    <AppImage
                      uri={zone.logo}
                      style={{ width: 44, height: 44, borderRadius: 4 }}
                      fallbackText={zone.name}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="label" weight="bold">
                        {zone.name}
                      </AppText>
                      <AppText variant="small" color={colors.textMuted} numberOfLines={1}>
                        {zone.tagline ?? zone.description}
                      </AppText>
                      <AppText variant="small" color={colors.textSubtle}>
                        {zone.member_count ?? 0} members
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                  </Row>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        {topCategories.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <SectionHeader
              title="Browse by Category"
              subtitle="Explore our wide range of collections and find exactly what you need."
              actionLabel="View All Categories"
              onAction={() => router.push('/products')}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {topCategories.slice(0, 8).map((category, index) => {
                const tints = [
                  ['#eff6ff', '#2563eb'],
                  ['#faf5ff', '#9333ea'],
                  ['#fff1f2', '#e11d48'],
                  ['#fffbeb', '#d97706'],
                  ['#ecfdf5', '#059669'],
                  ['#eef2ff', '#4f46e5'],
                  ['#ecfeff', '#0891b2'],
                  ['#fff7ed', '#ea580c'],
                ];
                const [bg, fg] = tints[index % tints.length];
                return (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      router.push({ pathname: '/category/[slug]', params: { slug: category.slug ?? category.id } })
                    }
                    style={{
                      width: '47%',
                      height: 96,
                      borderRadius: 4,
                      backgroundColor: bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <AppText style={{ fontSize: 16 }} weight="bold" color={fg}>
                      {category.name}
                    </AppText>
                    <AppText style={{ fontSize: 11, opacity: 0.7 }} color={fg}>
                      {category.products_count ?? 0} Products
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="Featured Products"
            subtitle="Handpicked products from top stores"
            actionLabel="View All"
            onAction={() => router.push('/products?mode=featured')}
            products={featured.data}
            loading={featured.isLoading}
          />
        </View>

        {stores.data && stores.data.items.length > 0 ? (
          <View style={{ paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, marginHorizontal: -spacing.lg, backgroundColor: 'rgba(248,250,252,0.6)' }}>
            <SectionHeader
              title="Trending Stores"
              subtitle="Stores making waves on EazyStore"
              actionLabel="View All Stores"
              onAction={() => router.push('/products?mode=stores')}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {stores.data.items.slice(0, 4).map((store) => (
                <Pressable
                  key={store.id}
                  onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.slug } })}
                  style={{ width: '47%', gap: spacing.xs }}
                >
                  <AppImage
                    uri={store.logo}
                    style={{ width: '100%', aspectRatio: 1, borderRadius: 4 }}
                    fallbackText={store.store_name}
                  />
                  <AppText style={{ fontSize: 12 }} weight="bold" numberOfLines={1}>
                    {store.store_name}
                  </AppText>
                  <AppText style={{ fontSize: 10 }} color={colors.textSubtle}>
                    {store.total_products ?? 0} products
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionGrid
            title="All Products"
            subtitle="Everything on EazyStore"
            actionLabel="View All"
            onAction={() => router.push('/products')}
            products={allProducts.data?.items}
            loading={allProducts.isLoading}
            showSkeleton={!deals.data}
          />
          <Pressable
            onPress={() => router.push('/products')}
            style={{
              alignSelf: 'center',
              backgroundColor: '#17c06e',
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 4,
              marginTop: spacing.md,
            }}
          >
            <AppText
              style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 }}
              color="#ffffff"
            >
              See More Products
            </AppText>
          </Pressable>
        </View>

        <View
          style={{
            paddingVertical: spacing.xl,
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.surfaceAlt,
            marginHorizontal: -spacing.lg,
          }}
        >
          <AppText style={{ fontSize: 18 }} weight="bold">
            Powering 40,000+ Growing Brands
          </AppText>
          <AppText variant="small" color={colors.textMuted} center>
            Trusted by sellers across Nigeria on EazyStore
          </AppText>
          <Spacer height={8} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
            <Row style={{ gap: spacing.md }}>
              {['Nike', 'Adidas', 'Zara', 'Samsung', 'Apple', 'Gucci', 'H&M', 'Shoprite'].map((name) => (
                <View
                  key={name}
                  style={{
                    height: 56,
                    paddingHorizontal: 28,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText style={{ fontSize: 16, fontStyle: 'italic' }} weight="bold" color={colors.textMuted}>
                    {name}
                  </AppText>
                </View>
              ))}
            </Row>
          </ScrollView>
        </View>
      </ScrollView>
    </Screen>
  );
}
