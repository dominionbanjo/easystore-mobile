import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { AppText, Spacer } from '@/components/ui/Text';
import { AppInput } from '@/components/ui/Input';
import { Chip, SegmentedControl } from '@/components/ui/Button';
import { ProductGrid } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useAppTheme } from '@/theme';
import { useSearchProductsQuery } from '@/api/productApi';
import { useDebounce } from '@/hooks/usePagination';
import type { IProductSearchParams } from '@/types/product';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'date_desc';

export default function SearchScreen() {
  const { colors, spacing } = useAppTheme();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState(0);
  const [limit] = useState(30);

  const debouncedQuery = useDebounce(query, 400);

  const params: IProductSearchParams = {
    q: debouncedQuery || undefined,
    sort,
    inStock: inStock ? true : undefined,
    onSale: onSale ? true : undefined,
    minPrice: minPrice ? Number(minPrice) * 100 : undefined,
    maxPrice: maxPrice ? Number(maxPrice) * 100 : undefined,
    rating: rating > 0 ? rating : undefined,
    limit,
  };

  const hasFilters =
    Boolean(debouncedQuery) || sort !== 'relevance' || inStock || onSale || Boolean(minPrice) || Boolean(maxPrice) || rating > 0;

  const { data, isLoading, isFetching } = useSearchProductsQuery(params, {
    skip: !hasFilters,
  });

  const products = data?.items ?? [];
  const showSkeleton = isLoading || (isFetching && products.length === 0);

  return (
    <Screen>
      <Spacer height={8} />
      <AppText style={{ fontSize: 26, letterSpacing: -0.4 }} weight="black">
        Discover
      </AppText>
      <Spacer height={12} />
      <AppInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search products..."
        icon={<Ionicons name="search" size={18} color={colors.textSubtle} />}
        autoCapitalize="none"
      />
      <Spacer height={12} />
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Chip label="In stock" selected={inStock} onPress={() => setInStock((v) => !v)} />
        <Chip label="On sale" selected={onSale} onPress={() => setOnSale((v) => !v)} />
        {[4, 3, 2].map((star) => (
          <Chip
            key={star}
            label={`${star}★ & up`}
            selected={rating === star}
            onPress={() => setRating((current) => (current === star ? 0 : star))}
          />
        ))}
      </View>
      <Spacer height={12} />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppInput
            value={minPrice}
            onChangeText={(text) => setMinPrice(text.replace(/[^0-9.]/g, ''))}
            placeholder="Min ₦"
            keyboardType="decimal-pad"
            size="sm"
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppInput
            value={maxPrice}
            onChangeText={(text) => setMaxPrice(text.replace(/[^0-9.]/g, ''))}
            placeholder="Max ₦"
            keyboardType="decimal-pad"
            size="sm"
          />
        </View>
      </View>
      <Spacer height={12} />
      <SegmentedControl<SortOption>
        value={sort}
        onChange={setSort}
        options={[
          { label: 'Relevance', value: 'relevance' },
          { label: 'Price ↑', value: 'price_asc' },
          { label: 'Price ↓', value: 'price_desc' },
          { label: 'Top rated', value: 'rating_desc' },
        ]}
      />
      <Spacer height={16} />
      {showSkeleton ? (
        <ProductGridSkeleton count={6} />
      ) : products.length === 0 ? (
        <View style={{ paddingTop: spacing.xxl }}>
          <AppText variant="subtitle" color={colors.textMuted} center>
            {debouncedQuery ? `No results for "${debouncedQuery}"` : 'Start typing to search'}
          </AppText>
        </View>
      ) : (
        <>
          <ProductGrid products={products} />
          {isFetching ? (
            <View style={{ paddingVertical: spacing.lg }}>
              <AppText variant="small" color={colors.textSubtle} center>
                Loading more…
              </AppText>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}
