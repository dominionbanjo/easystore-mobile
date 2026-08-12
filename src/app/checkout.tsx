import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import {
  useGetOrderSummaryMutation,
  useCreateOnlineOrderMutation,
} from '@/api/orderApi';
import { useGetCartQuery } from '@/api/cartApi';
import { useGetMeQuery } from '@/api/userApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import { useAppSelector } from '@/hooks';
import type { IUserAddress } from '@/types/auth';

export default function CheckoutScreen() {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const guestCart = useAppSelector((state) => state.cart.guestItems);

  const { data: serverCart, isLoading: cartLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: profile } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [getSummary] = useGetOrderSummaryMutation();
  const [createOnlineOrder, { isLoading: creating }] = useCreateOnlineOrderMutation();

  const [summary, setSummary] = useState<{
    subtotal: number;
    shipping: number;
    platform_fee?: number;
    total: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();

  const addresses: IUserAddress[] = profile?.addresses ?? [];

  const items = isAuthenticated ? (serverCart?.items ?? []) : guestCart;

  const handleFetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const result = await getSummary({
        order_items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      }).unwrap();
      setSummary(result);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSummaryLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.showError('Sign in to checkout');
      router.push('/login');
      return;
    }
    if (!selectedAddressId && addresses.length > 0) {
      toast.showError('Select a delivery address');
      return;
    }
    try {
      const result = await createOnlineOrder({
        email: profile?.email ?? '',
        order_items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        delivery_address_id: selectedAddressId,
      }).unwrap();

      if (result.payment_url) {
        const openResult = await WebBrowser.openAuthSessionAsync(
          result.payment_url,
          'EazyStore://verify-payment',
        );
        if (openResult.type === 'success' && openResult.url) {
          const reference = openResult.url.split('reference=')[1]?.split('&')[0];
          router.replace({
            pathname: '/verify-payment',
            params: { reference: reference ?? result.order_id, orderId: result.order_id },
          });
        } else {
          router.replace({ pathname: '/verify-payment', params: { orderId: result.order_id } });
        }
      } else {
        toast.showSuccess('Order placed successfully');
        router.replace('/orders');
      }
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const subtotal = isAuthenticated ? (serverCart?.subtotal ?? 0) : items.reduce(
    (sum, item) => sum + (item.discount_price ?? item.price) * item.quantity,
    0,
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Checkout', headerShown: true }} />
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        {cartLoading ? (
          <ListSkeleton count={3} />
        ) : items.length === 0 ? (
          <View style={{ paddingTop: spacing.xxl }}>
            <AppText center color={colors.textMuted}>
              Your cart is empty
            </AppText>
          </View>
        ) : (
          <>
            <Card style={{ gap: spacing.sm }}>
              <AppText variant="label" weight="bold">
                Items ({items.length})
              </AppText>
              {items.map((item, index) => (
                <View key={`${item.product_id}-${index}`} style={{ gap: spacing.sm }}>
                  <Row style={{ gap: spacing.md }}>
                    <AppImage
                      uri={item.image}
                      style={{ width: 48, height: 48 }}
                      fallbackText={item.name}
                    />
                    <View style={{ flex: 1 }}>
                      <AppText variant="small" weight="medium" numberOfLines={2}>
                        {item.name}
                      </AppText>
                      <AppText variant="small" color={colors.textMuted}>
                        Qty {item.quantity} · {formatNGN((item.discount_price ?? item.price) * item.quantity)}
                      </AppText>
                    </View>
                  </Row>
                </View>
              ))}
            </Card>

            {isAuthenticated && addresses.length > 0 ? (
              <Card style={{ gap: spacing.sm }}>
                <AppText variant="label" weight="bold">
                  Delivery Address
                </AppText>
                {addresses.map((address) => {
                  const selected = address.id === selectedAddressId;
                  return (
                    <Button
                      key={address.id}
                      title={`${address.street}, ${address.city}, ${address.state}`}
                      variant={selected ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => setSelectedAddressId(address.id)}
                    />
                  );
                })}
              </Card>
            ) : null}

            <Card style={{ gap: spacing.sm }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.textMuted}>
                  Subtotal
                </AppText>
                <AppText variant="label" weight="semibold">
                  {formatNGN(subtotal)}
                </AppText>
              </Row>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.textMuted}>
                  Delivery fee
                </AppText>
                <AppText variant="label" weight="semibold">
                  {summary ? formatNGN(summary.shipping) : '—'}
                </AppText>
              </Row>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.textMuted}>
                  Platform fee
                </AppText>
                <AppText variant="label" weight="semibold">
                  {summary?.platform_fee ? formatNGN(summary.platform_fee) : '—'}
                </AppText>
              </Row>
              <Spacer height={4} />
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" weight="bold">
                  Total
                </AppText>
                <AppText variant="title" weight="bold" color={colors.primary}>
                  {formatNGN(summary?.total ?? subtotal)}
                </AppText>
              </Row>
            </Card>

            <Button
              title={summary ? 'Place Order & Pay' : 'Calculate Delivery'}
              onPress={summary ? handlePlaceOrder : handleFetchSummary}
              loading={summaryLoading || creating}
            />
            <Spacer height={8} />
            <AppText variant="small" color={colors.textSubtle} center>
              Payment is securely handled by Paystack. Escrow protection applies to eligible orders.
            </AppText>
          </>
        )}
      </View>
    </>
  );
}
