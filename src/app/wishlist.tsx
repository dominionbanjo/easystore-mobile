import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
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

  const { data: items, isLoading } = useGetWishlistQuery();
  const [removeItem] = useRemoveFromWishlistMutation();
  const [moveAll, { isLoading: moving }] = useMoveWishlistToCartMutation();

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
        ) : items && items.length > 0 ? (
          <>
            <Button
              title="Move All to Cart"
              variant="outline"
              size="sm"
              fullWidth={false}
              loading={moving}
              onPress={handleMoveAll}
            />
            <View style={{ gap: spacing.md }}>
              {items.map((item) => (
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
                            router.push({ pathname: '/product/[slug]', params: { slug: item.slug ?? item.product_id } })
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
          </>
        ) : (
          <EmptyState
            icon={<Ionicons name="heart-outline" size={32} color={colors.textSubtle} />}
            title="Your wishlist is empty"
            description="Save products you love for later"
            actionLabel="Browse products"
            onAction={() => router.push('/home')}
          />
        )}
      </View>
    </>
  );
}
