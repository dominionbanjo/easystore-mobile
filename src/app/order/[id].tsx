import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Package } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNGN } from '@/utils/money';
import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} from '@/api/orderApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

export default function OrderDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(params.id);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={{ padding: 16 }}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={{ padding: 32, gap: 16 }}>
        <AppText center color={colors.textMuted}>
          Order not found
        </AppText>
        <Button title="Try Again" variant="outline" fullWidth={false} onPress={() => refetch()} />
      </View>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      toast.showSuccess('Order canceled');
      setCancelOpen(false);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const reference = order.payment_reference ?? order.id;
  const displayReference = reference.slice(0, 8).toUpperCase();
  const fee = Math.round(Number(order.subtotal) * 0.01);

  const customer = order.buyer ?? order.vendor;

  return (
    <>
      <Stack.Screen options={{ title: `Order ${displayReference}`, headerShown: true }} />
      <View style={{ flex: 1, padding: 16, gap: 16 }}>
        <Card style={{ gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              {new Date(order.created_at).toLocaleString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </AppText>
            <StatusBadge status={order.status} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Order #
            </AppText>
            <AppText variant="label" weight="bold" numberOfLines={1} style={{ flex: 1, textAlign: 'right', marginLeft: 8 }}>
              {displayReference}
            </AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Payment
            </AppText>
            <StatusBadge status={order.payment_status} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" color={colors.textMuted}>
              Method
            </AppText>
            <AppText variant="label" weight="medium">
              {order.payment_method}
            </AppText>
          </Row>
          {order.payment_reference ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="label" color={colors.textMuted}>
                Reference
              </AppText>
              <AppText variant="small" color={colors.textSubtle} numberOfLines={1} style={{ flex: 1, textAlign: 'right', marginLeft: 8 }}>
                {order.payment_reference}
              </AppText>
            </Row>
          ) : null}
        </Card>

        {customer ? (
          <Card style={{ gap: 4 }}>
            <AppText variant="label" weight="bold">
              Store
            </AppText>
            <AppText variant="label" numberOfLines={1}>
              {order.buyer
                ? `${order.buyer.first_name} ${order.buyer.last_name}`
                : order.vendor?.stores?.[0]?.store_name}
            </AppText>
            {'email' in customer && customer.email ? (
              <AppText variant="small" color={colors.textMuted}>
                {customer.email}
              </AppText>
            ) : null}
          </Card>
        ) : null}

        <Card style={{ gap: 8 }}>
          <AppText variant="label" weight="bold">
            Items
          </AppText>
          {order.order_items.map((item, index) => (
            <Row key={`${item.product_id}-${index}`} style={{ gap: 12 }}>
              <AppImage uri={item.image} style={{ width: 44, height: 44 }} fallbackText={item.name} />
              <View style={{ flex: 1 }}>
                <AppText variant="small" weight="medium" numberOfLines={2}>
                  {item.name}
                </AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {item.quantity} × {formatNGN(item.discount_price ?? item.price)}
                </AppText>
              </View>
              <AppText variant="small" weight="semibold">
                {formatNGN(Number(item.discount_price ?? item.price) * item.quantity)}
              </AppText>
            </Row>
          ))}
          <Spacer height={4} />
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color={colors.textMuted}>
              Subtotal
            </AppText>
            <AppText variant="small">{formatNGN(order.subtotal)}</AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color={colors.textMuted}>
              Fee (1%)
            </AppText>
            <AppText variant="small">{formatNGN(fee)}</AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" color={colors.textMuted}>
              Delivery
            </AppText>
            <AppText variant="small">{formatNGN(order.shipping_fee ?? 0)}</AppText>
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="bold">
              Total
            </AppText>
            <AppText variant="label" weight="bold" color={colors.primary}>
              {formatNGN(order.total)}
            </AppText>
          </Row>
        </Card>

        {order.delivery ? (
          <Card style={{ gap: 8 }}>
            <Row style={{ gap: 8 }}>
              <Package size={18} color={colors.primary} />
              <AppText variant="label" weight="bold">
                Delivery
              </AppText>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="small" color={colors.textMuted}>
                Status
              </AppText>
              <StatusBadge status={order.delivery.delivery_status} />
            </Row>
            {order.delivery.tracking_number ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="small" color={colors.textMuted}>
                  Tracking
                </AppText>
                <AppText variant="small" weight="medium" numberOfLines={1} style={{ flex: 1, textAlign: 'right', marginLeft: 8 }}>
                  {order.delivery.tracking_number}
                </AppText>
              </Row>
            ) : null}
            {order.delivery.estimated_delivery ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="small" color={colors.textMuted}>
                  Estimated
                </AppText>
                <AppText variant="small" weight="medium">
                  {new Date(order.delivery.estimated_delivery).toLocaleDateString('en-NG')}
                </AppText>
              </Row>
            ) : null}
            {order.delivery.confirmation_code && order.status !== 'delivered' && order.status !== 'completed' ? (
              <AppText variant="small" color={colors.textMuted}>
                Confirmation code: {order.delivery.confirmation_code}
              </AppText>
            ) : null}
          </Card>
        ) : null}

        <View style={{ gap: 8 }}>
          <Button title="Track in My Orders" variant="outline" onPress={() => router.replace('/orders')} />
          {order.status === 'pending' || order.status === 'processing' ? (
            order.payment_status === 'pending' ? (
              <Button
                title="Cancel Order"
                variant="danger"
                onPress={() => setCancelOpen(true)}
                loading={cancelling}
              />
            ) : null
          ) : null}
        </View>
      </View>

      <ConfirmDialog
        visible={cancelOpen}
        title="Cancel this order?"
        message="This action cannot be undone."
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </>
  );
}
