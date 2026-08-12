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
  const [limit, setLimit] = useState(30);

  const debouncedQuery = useDebounce(query, 400);

  const params: IProductSearchParams = {
    q: debouncedQuery || undefined,
    sort,
    inStock: inStock ? true : undefined,
    onSale: onSale ? true : undefined,
    limit,
  };

  const { data, isLoading, isFetching } = useSearchProductsQuery(params, {
    skip: !debouncedQuery && !sort && !inStock && !onSale,
  });

  const products = data?.items ?? [];
  const showSkeleton = isLoading || (isFetching && products.length === 0);

  return (
    <Screen>
      <Spacer height={8} />
      <AppText variant="subtitle" weight="bold">
        Search
      </AppText>
      <Spacer height={12} />
      <AppInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search products, stores, categories…"
        icon={<Ionicons name="search" size={18} color={colors.textSubtle} />}
        autoCapitalize="none"
      />
      <Spacer height={12} />
      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        <Chip label="In stock" selected={inStock} onPress={() => setInStock((v) => !v)} />
        <Chip label="On sale" selected={onSale} onPress={() => setOnSale((v) => !v)} />
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
