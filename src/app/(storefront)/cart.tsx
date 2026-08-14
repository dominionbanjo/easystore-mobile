import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, Trash2 } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/Button';
import { AppImage } from '@/components/shared/AppImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { formatNaira } from '@/utils/money';
import { useAppTheme } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/hooks';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from '@/api/cartApi';
import {
  updateGuestQuantity,
  removeGuestItem,
  clearGuestCart,
  selectGuestCart,
} from '@/features/cartSlice';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { ICartItem, IGuestCartItem } from '@/types/cart';

export default function CartScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const guestCart = useAppSelector(selectGuestCart);

  const {
    data: serverCart,
    isLoading: isServerLoading,
    isFetching,
    isError: isServerError,
    refetch,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const [clearOpen, setClearOpen] = useState(false);

  const items: (ICartItem | IGuestCartItem)[] = isAuthenticated
    ? (serverCart?.cart.items ?? [])
    : guestCart.items;
  const isLoading = isAuthenticated ? isServerLoading || (isFetching && items.length === 0) : false;

  const subtotal = isAuthenticated
    ? serverCart?.cart.subtotal ?? 0
    : guestCart.subtotal;

  const serviceCharge = Math.round(subtotal * 0.01);
  const total = subtotal + serviceCharge;

  const handleUpdateQuantity = (item: ICartItem | IGuestCartItem, quantity: number) => {
    if (isAuthenticated) {
      updateCartItem({
        productId: item.product_id,
        body: { quantity, variant_id: item.variant_id },
      }).catch((error) => toast.showError(getErrorMessage(error)));
    } else {
      const key = `${item.product_id}|${item.variant_id ?? ''}|${item.size ?? ''}|${item.color ?? ''}`;
      dispatch(updateGuestQuantity({ key, quantity }));
    }
  };

  const handleRemove = (item: ICartItem | IGuestCartItem) => {
    if (isAuthenticated) {
      removeCartItem(item.product_id).catch((error) =>
        toast.showError(getErrorMessage(error)),
      );
    } else {
      const key = `${item.product_id}|${item.variant_id ?? ''}|${item.size ?? ''}|${item.color ?? ''}`;
      dispatch(removeGuestItem(key));
    }
  };

  const handleClearCart = async () => {
    setClearOpen(false);
    if (!isAuthenticated) {
      dispatch(clearGuestCart());
      toast.showSuccess('Cart cleared');
      return;
    }
    try {
      await Promise.all(
        items.map((item) => removeCartItem(item.product_id).unwrap()),
      );
      toast.showSuccess('Cart cleared');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <ListSkeleton count={4} />
      </Screen>
    );
  }

  if (isAuthenticated && isServerError) {
    return (
      <Screen>
        <EmptyState
          icon={<ShoppingCart size={32} color={colors.textSubtle} />}
          title="Failed to load cart"
          description="Check your connection and try again"
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="subtitle" weight="bold">
            My Cart
          </AppText>
          {items.length > 0 ? (
            <Pressable onPress={() => setClearOpen(true)} hitSlop={8}>
              <AppText variant="label" weight="semibold" color={colors.danger}>
                Clear Cart
              </AppText>
            </Pressable>
          ) : null}
        </Row>
      </View>
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={32} color={colors.textSubtle} />}
          title="Your cart is empty"
          description="Browse the marketplace and add items to your cart"
          actionLabel="Start shopping"
          onAction={() => router.push('/home')}
        />
      ) : (
        <View style={{ flex: 1, padding: spacing.lg }}>
          <View style={{ gap: spacing.md }}>
            {items.map((item) => {
              const key = `${item.product_id}|${item.variant_id ?? ''}|${item.size ?? ''}|${item.color ?? ''}`;
              const unitPrice = item.discount_price ?? item.price;
              return (
                <Card key={key} padded={false} style={{ padding: spacing.md }}>
                  <Row style={{ gap: spacing.md, alignItems: 'flex-start' }}>
                    <AppImage
                      uri={item.image}
                      style={{ width: 64, height: 64 }}
                      fallbackText={item.name}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText variant="label" weight="medium" numberOfLines={2}>
                        {item.name}
                      </AppText>
                      {item.variant_options || item.size || item.color ? (
                        <AppText variant="small" color={colors.textSubtle}>
                          {[
                            item.size,
                            item.color,
                            ...Object.values(item.variant_options ?? {}),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </AppText>
                      ) : null}
                      <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
                        <AppText variant="label" weight="bold" color={colors.primary}>
                          {formatNaira(unitPrice * item.quantity)}
                        </AppText>
                        <Row style={{ gap: spacing.sm }}>
                          <IconButton
                            accessibilityLabel="Decrease quantity"
                            icon={
                              <AppText color={colors.text} style={{ fontSize: 16 }}>
                                −
                              </AppText>
                            }
                            onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                          />
                          <AppText variant="label" weight="semibold">
                            {item.quantity}
                          </AppText>
                          <IconButton
                            accessibilityLabel="Increase quantity"
                            icon={
                              <AppText color={colors.text} style={{ fontSize: 16 }}>
                                +
                              </AppText>
                            }
                            onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                          />
                        </Row>
                      </Row>
                    </View>
                    <IconButton
                      accessibilityLabel="Remove item"
                      icon={<Trash2 size={18} color={colors.danger} />}
                      onPress={() => handleRemove(item)}
                    />
                  </Row>
                </Card>
              );
            })}
          </View>
          <Spacer height={16} />
          <Card style={{ gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" color={colors.textMuted}>
                Subtotal
              </AppText>
              <AppText variant="label" weight="semibold">
                {formatNaira(subtotal)}
              </AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" color={colors.textMuted}>
                Delivery
              </AppText>
              <AppText variant="label" color={colors.textMuted}>
                Calculated at checkout
              </AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" color={colors.textMuted}>
                Service charge (1%)
              </AppText>
              <AppText variant="label" weight="semibold">
                {formatNaira(serviceCharge)}
              </AppText>
            </Row>
            <Spacer height={4} />
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" weight="bold">
                Total
              </AppText>
              <AppText variant="label" weight="bold" color={colors.primary}>
                {formatNaira(total)}
              </AppText>
            </Row>
            <Spacer height={4} />
            <Button
              title={isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/checkout');
                } else {
                  router.push('/login');
                }
              }}
            />
            <Button
              title="Continue Shopping"
              variant="secondary"
              onPress={() => router.push('/home')}
            />
          </Card>
        </View>
      )}

      <ConfirmDialog
        visible={clearOpen}
        title="Clear your cart?"
        message="This will remove all items from your cart."
        confirmText="Clear Cart"
        destructive
        onConfirm={handleClearCart}
        onCancel={() => setClearOpen(false)}
      />
    </Screen>
  );
}
