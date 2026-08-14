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
import { formatNaira, formatNGN } from '@/utils/money';
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
import type { ICheckoutSummaryGroup } from '@/types/order';

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

  const [summary, setSummary] = useState<ICheckoutSummaryGroup[] | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();

  const addresses: IUserAddress[] = profile?.user.addresses ?? [];

  const items = isAuthenticated ? (serverCart?.cart.items ?? []) : guestCart;

  const handleFetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const result = await getSummary({
        order_items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id ?? undefined,
          quantity: item.quantity,
        })),
      }).unwrap();
      setSummary(result.data);
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
    if (!selectedAddressId) {
      toast.showError('Select a delivery address');
      if (addresses.length === 0) {
        router.push('/addresses');
      }
      return;
    }
    try {
      const result = await createOnlineOrder({
        email: profile?.user.email ?? '',
        order_items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id ?? undefined,
          quantity: item.quantity,
          size: item.size ?? undefined,
          color: item.color ?? undefined,
        })),
        delivery_address_id: selectedAddressId,
      }).unwrap();

      if (result.payment_url) {
        const openResult = await WebBrowser.openAuthSessionAsync(
          result.payment_url,
          'easystore://verify-payment',
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

  const subtotal = isAuthenticated ? (serverCart?.cart.subtotal ?? 0) : items.reduce(
    (sum, item) => sum + (item.discount_price ?? item.price) * item.quantity,
    0,
  );

  const serviceCharge = Math.round(subtotal * 0.01);
  const summaryTotalKobo =
    summary?.reduce((sum, group) => sum + group.subtotal, 0) ?? null;
  const summaryServiceCharge =
    summaryTotalKobo !== null ? Math.round(summaryTotalKobo * 0.01) : 0;

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
                        Qty {item.quantity} · {formatNaira((item.discount_price ?? item.price) * item.quantity)}
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
                  {formatNaira(subtotal)}
                </AppText>
              </Row>
              {summary?.map((group) => (
                <Row key={group.store_id ?? group.vendor_id} style={{ justifyContent: 'space-between' }}>
                  <AppText variant="small" color={colors.textMuted} numberOfLines={1} style={{ flex: 1 }}>
                    {group.store_name} · {group.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                  </AppText>
                  <AppText variant="small" weight="semibold">
                    {formatNGN(group.subtotal)}
                  </AppText>
                </Row>
              ))}
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.textMuted}>
                  Service charge (1%)
                </AppText>
                <AppText variant="label" weight="semibold">
                  {summaryTotalKobo !== null ? formatNGN(summaryServiceCharge) : formatNaira(serviceCharge)}
                </AppText>
              </Row>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" color={colors.textMuted}>
                  Delivery fee
                </AppText>
                <AppText variant="label" weight="semibold">
                  {summaryTotalKobo !== null ? 'Calculated at payment' : '—'}
                </AppText>
              </Row>
              <Spacer height={4} />
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" weight="bold">
                  Total
                </AppText>
                <AppText variant="title" weight="bold" color={colors.primary}>
                  {summaryTotalKobo !== null
                    ? formatNGN(summaryTotalKobo + summaryServiceCharge)
                    : formatNaira(subtotal + serviceCharge)}
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
