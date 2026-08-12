import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal } from '@/components/ui/Modal';
import { useGetAdminSchoolZonesQuery, useApproveSchoolZoneMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { ISchoolZone , SchoolZoneStatus } from '@/types/zone';

export default function AdminSchoolZonesScreen() {
  const { spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetAdminSchoolZonesQuery({ page });
  const [approveZone] = useApproveSchoolZoneMutation();
  const [target, setTarget] = useState<ISchoolZone | null>(null);

  const handleDecision = async (decision: SchoolZoneStatus) => {
    if (!target) {
      return;
    }
    try {
      await approveZone({ zoneId: target.id, decision }).unwrap();
      toast.showSuccess(decision === 'active' ? 'Zone approved' : `Zone ${decision}`);
      setTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(zone) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={zone.logo}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                fallbackText={zone.name}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold">
                  {zone.name}
                </AppText>
                <AppText variant="small" color="gray" numberOfLines={2}>
                  {zone.tagline ?? zone.description}
                </AppText>
                <Row style={{ gap: spacing.xs }}>
                  <StatusBadge status={zone.status ?? 'pending'} />
                  <AppText variant="small" color="gray">
                    {zone.member_count ?? 0} members · {zone.state}
                  </AppText>
                </Row>
              </View>
              <Button title="Review" variant="outline" size="sm" fullWidth={false} onPress={() => setTarget(zone)} />
            </Row>
          </Card>
        )}
        emptyTitle="No school zones"
      />

      <AppModal
        visible={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`${target?.name ?? ''} · Decision`}
        footer={
          <View style={{ gap: 8 }}>
            <Button title="Approve Zone" onPress={() => handleDecision('active')} />
            <Button title="Reject Zone" variant="danger" onPress={() => handleDecision('rejected')} />
          </View>
        }
        scrollable
      >
        <View style={{ gap: 8 }}>
          <AppText variant="small" color="gray">
            {target?.description}
          </AppText>
          <AppText variant="small" color="gray">
            State: {target?.state ?? '—'} · Contact: {target?.contact_email ?? '—'}
          </AppText>
        </View>
      </AppModal>
    </View>
  );
}
