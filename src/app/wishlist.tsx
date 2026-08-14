import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Heart } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { AppInput } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNGN } from '@/utils/money';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useMoveWishlistToCartMutation,
} from '@/api/wishlistApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function WishlistScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, refetch } = useGetWishlistQuery();
  const [removeItem] = useRemoveFromWishlistMutation();
  const [moveAll, { isLoading: moving }] = useMoveWishlistToCartMutation();

  const items = data?.wishlist ?? [];
  const searchTerm = query.trim().toLowerCase();
  const filteredItems = searchTerm
    ? items.filter((item) => item.name.toLowerCase().includes(searchTerm))
    : items;

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId).unwrap();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleMoveAll = async () => {
    try {
      await moveAll().unwrap();
      toast.showSuccess('Items moved to cart');
      router.push('/cart');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'My Wishlist', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : isError ? (
          <EmptyState
            icon={<Heart size={32} color={colors.textSubtle} />}
            title="Failed to load wishlist"
            description="Check your connection and try again"
            actionLabel="Try Again"
            onAction={() => refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart size={32} color={colors.textSubtle} />}
            title="Your wishlist is empty"
            description="Save products you love for later"
            actionLabel="Discover Products"
            onAction={() => router.push('/search')}
          />
        ) : (
          <>
            <AppText variant="caption" color={colors.textMuted}>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </AppText>
            <AppInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search your wishlist"
              size="sm"
            />
            <Button
              title="Move All to Cart"
              variant="outline"
              size="sm"
              fullWidth={false}
              loading={moving}
              onPress={handleMoveAll}
            />
            <View style={{ gap: spacing.md }}>
              {filteredItems.map((item) => (
                <Card key={item.product_id} style={{ gap: spacing.md }}>
                  <Row style={{ gap: spacing.md }}>
                    <AppImage
                      uri={item.image}
                      style={{ width: 72, height: 72 }}
                      fallbackText={item.name}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="label" weight="medium" numberOfLines={2}>
                        {item.name}
                      </AppText>
                      <AppText variant="label" weight="bold" color={colors.primary}>
                        {formatNGN(item.price)}
                      </AppText>
                      <Row style={{ gap: spacing.sm, marginTop: 4 }}>
                        <Button
                          title="View"
                          variant="outline"
                          size="sm"
                          fullWidth={false}
                          onPress={() =>
                            router.push({ pathname: '/product/[slug]', params: { slug: item.product?.slug ?? item.product_id } })
                          }
                        />
                        <Button
                          title="Remove"
                          variant="ghost"
                          size="sm"
                          fullWidth={false}
                          onPress={() => handleRemove(item.product_id)}
                        />
                      </Row>
                    </View>
                  </Row>
                </Card>
              ))}
            </View>
            {filteredItems.length === 0 ? (
              <AppText variant="caption" color={colors.textMuted} center>
                No items match your search
              </AppText>
            ) : null}
          </>
        )}
      </View>
    </>
  );
}
