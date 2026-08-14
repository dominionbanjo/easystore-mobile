import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';


import { Search } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { ConfirmDialog } from '@/components/ui/Modal';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { formatNGN } from '@/utils/money';
import {
  useGetVendorProductsQuery,
  useUpdateProductStatusMutation,
  useToggleProductOnSaleMutation,
  useDeleteProductMutation,
} from '@/api/productApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IStoreProduct } from '@/types/product';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Draft', value: 'draft' },
];

const INVENTORY_FILTERS: FilterOption[] = [
  { label: 'All Stock', value: 'all' },
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'On Sale', value: 'on_sale' },
];

type InventoryFilter = 'all' | 'out_of_stock' | 'on_sale';

export default function VendorProductsScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();

  const [status, setStatus] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, refetch } = useGetVendorProductsQuery({
    page,
    limit: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const [updateStatus] = useUpdateProductStatusMutation();
  const [toggleOnSale] = useToggleProductOnSaleMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [deletingProduct, setDeletingProduct] = useState<IStoreProduct | null>(null);

  const visibleItems = (data?.items ?? []).filter((product) => {
    if (inventoryFilter === 'out_of_stock') {
      return product.is_out_of_stock || product.stock <= 0;
    }
    if (inventoryFilter === 'on_sale') {
      return Boolean(product.on_sale);
    }
    return true;
  });

  const handleToggleStatus = async (product: IStoreProduct) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await updateStatus({ id: product.id, status: nextStatus }).unwrap();
      toast.showSuccess(product.status === 'active' ? 'Product deactivated' : 'Product activated');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleToggleOnSale = async (product: IStoreProduct) => {
    try {
      await toggleOnSale({ id: product.id, on_sale: !product.on_sale }).unwrap();
      toast.showSuccess(product.on_sale ? 'Removed from sale' : 'Marked on sale');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) {
      return;
    }
    try {
      await deleteProduct(deletingProduct.id).unwrap();
      toast.showSuccess('Product deleted');
      setDeletingProduct(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load products
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md }}>
        <Row style={{ gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <FilterDropdown
              label="Status"
              value={status}
              onChange={(filter) => {
                setStatus(filter);
                setPage(1);
              }}
              options={STATUS_FILTERS}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FilterDropdown
              label="Stock"
              value={inventoryFilter}
              onChange={(filter) => setInventoryFilter(filter as InventoryFilter)}
              options={INVENTORY_FILTERS}
            />
          </View>
        </Row>
        <Spacer height={4} />
        <Card padded={false} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Row style={{ gap: spacing.sm }}>
            <Search size={16} color={colors.textSubtle} />
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
              placeholder="Search products…"
              placeholderTextColor={colors.textSubtle}
              style={{ flex: 1, fontSize: 14, color: colors.text }}
            />
          </Row>
        </Card>
      </View>
      <Spacer height={8} />
      <PaginatedList
        items={visibleItems}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(product) => (
          <Card
            onPress={() =>
              router.push({ pathname: '/vendor/product-edit/[id]', params: { id: product.id } })
            }
            style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}
          >
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={product.image}
                style={{ width: 64, height: 64 }}
                fallbackText={product.name}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="label" weight="medium" numberOfLines={2}>
                  {product.name}
                </AppText>
                <Row style={{ gap: spacing.xs }}>
                  <StatusBadge status={product.status} />
                  {product.on_sale ? <StatusBadge status="on_sale" /> : null}
                </Row>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ gap: spacing.xs }}>
                    <AppText variant="small" weight="semibold" color={colors.primary}>
                      {formatNGN(product.discount_price ?? product.price)}
                    </AppText>
                    {product.on_sale && product.discount_price ? (
                      <AppText
                        variant="small"
                        color={colors.textSubtle}
                        style={{ textDecorationLine: 'line-through' }}
                      >
                        {formatNGN(product.price)}
                      </AppText>
                    ) : null}
                  </Row>
                  <AppText variant="small" color={colors.textMuted}>
                    Stock: {product.stock}
                  </AppText>
                </Row>
              </View>
            </Row>
            <Row style={{ gap: spacing.sm }}>
              <Button
                title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={() => handleToggleStatus(product)}
              />
              <Button
                title={product.on_sale ? 'On Sale ✓' : 'Mark On Sale'}
                variant={product.on_sale ? 'primary' : 'ghost'}
                size="sm"
                fullWidth={false}
                onPress={() => handleToggleOnSale(product)}
              />
              <Button
                title="Delete"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setDeletingProduct(product)}
              />
            </Row>
          </Card>
        )}
        emptyTitle="No products found"
        emptyDescription="Add your first product to start selling"
        emptyActionLabel="Add Product"
        onEmptyAction={() => router.push('/vendor/product-new')}
      />
      <ConfirmDialog
        visible={Boolean(deletingProduct)}
        title={`Delete "${deletingProduct?.name ?? ''}"?`}
        message="This permanently removes the product from your store."
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </View>
  );
}
