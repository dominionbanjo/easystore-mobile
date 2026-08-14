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
import { AppInput } from '@/components/ui/Input';
import { FilterDropdown, type FilterOption } from '@/components/ui/FilterDropdown';
import { useGetAdminSchoolZonesQuery, useApproveSchoolZoneMutation } from '@/api/adminApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { ISchoolZone, SchoolZoneStatus } from '@/types/zone';

const STATUS_FILTERS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminSchoolZonesScreen() {
  const { radius, spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminSchoolZonesQuery({ page });
  const [approveZone] = useApproveSchoolZoneMutation();
  const [target, setTarget] = useState<ISchoolZone | null>(null);

  const zones = data?.items ?? [];
  const visibleZones = zones.filter((zone) => {
    const matchesStatus = status === '' || (zone.status ?? 'pending') === status;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || zone.name.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    total: zones.length,
    pending: zones.filter((zone) => (zone.status ?? 'pending') === 'pending').length,
    active: zones.filter((zone) => zone.status === 'active').length,
    rejected: zones.filter((zone) => zone.status === 'rejected').length,
  };

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
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { label: 'Total', value: counts.total },
            { label: 'Pending', value: counts.pending },
            { label: 'Active', value: counts.active },
            { label: 'Rejected', value: counts.rejected },
          ].map((stat) => (
            <Card key={stat.label} style={{ flex: 1, alignItems: 'center', gap: 2, padding: 10 }}>
              <AppText variant="subtitle" weight="extrabold">
                {stat.value}
              </AppText>
              <AppText variant="small" color="gray">
                {stat.label}
              </AppText>
            </Card>
          ))}
        </View>
        <AppInput
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          placeholder="Search zones…"
          size="sm"
        />
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
      <PaginatedList
        items={visibleZones}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        error={isError}
        onRetry={refetch}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(zone) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={zone.logo}
                style={{ width: 48, height: 48, borderRadius: radius.full }}
                fallbackText={zone.name}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold" numberOfLines={1}>
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
