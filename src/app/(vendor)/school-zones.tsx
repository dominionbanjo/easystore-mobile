import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Search } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import {
  useGetMyMembershipsQuery,
  useGetMyCreatedZonesQuery,
  useGetZonesQuery,
  useApplyToZoneMutation,
  useLeaveZoneMutation,
} from '@/api/zoneApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { ISchoolZone } from '@/types/zone';

export default function SchoolZonesScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const toast = useToast();

  const { data: memberships } = useGetMyMembershipsQuery();
  const { data: createdZones } = useGetMyCreatedZonesQuery();
  const { data: allZones, isLoading, isFetching, isError, refetch } = useGetZonesQuery({
    limit: 50,
  });
  const [browseSearch, setBrowseSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(browseSearch), 400);
    return () => clearTimeout(timer);
  }, [browseSearch]);

  const [applyZone, setApplyZone] = useState<ISchoolZone | null>(null);
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [apply, { isLoading: applying }] = useApplyToZoneMutation();
  const [leave, { isLoading: leaving }] = useLeaveZoneMutation();
  const [leavingZone, setLeavingZone] = useState<ISchoolZone | null>(null);

  const membershipZoneIds = new Set(memberships?.items.map((membership) => membership.zone?.id ?? '') ?? []);
  const createdZoneIds = new Set(createdZones?.items.map((zone) => zone.id) ?? []);

  const handleApply = async () => {
    if (!applyZone) {
      return;
    }
    try {
      await apply({
        zoneId: applyZone.id,
        body: {
          department: department || undefined,
          course: course || undefined,
        },
      }).unwrap();
      toast.showSuccess('Application submitted');
      setApplyZone(null);
      setDepartment('');
      setCourse('');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleLeave = async () => {
    if (!leavingZone) {
      return;
    }
    try {
      await leave(leavingZone.id).unwrap();
      toast.showSuccess('Left zone');
      setLeavingZone(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const query = debouncedSearch.trim().toLowerCase();
  const visibleZones =
    (allZones?.items ?? []).filter(
      (zone) =>
        !membershipZoneIds.has(zone.id) &&
        !createdZoneIds.has(zone.id) &&
        (query
          ? `${zone.name} ${zone.tagline ?? ''} ${zone.description ?? ''} ${zone.location ?? ''} ${zone.state ?? ''}`
              .toLowerCase()
              .includes(query)
          : true),
    ) ?? [];

  if (isError) {
    return (
      <View style={{ padding: spacing.xl, gap: spacing.md, alignItems: 'center' }}>
        <AppText center color={colors.textMuted}>
          Couldn&apos;t load school zones
        </AppText>
        <Button title="Try Again" onPress={refetch} fullWidth={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {memberships && memberships.items.length > 0 ? (
        <View style={{ padding: spacing.lg, paddingBottom: 0, gap: spacing.sm }}>
          <AppText variant="label" weight="bold">
            My Zones
          </AppText>
          {memberships.items.map((membership) => (
            <Card key={membership.id} style={{ gap: spacing.sm }}>
              <Row style={{ gap: spacing.md }}>
                <AppImage
                  uri={membership.zone?.logo}
                  style={{ width: 48, height: 48, borderRadius: radius.full }}
                  fallbackText={membership.zone?.name ?? 'Zone'}
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="label" weight="semibold">
                    {membership.zone?.name}
                  </AppText>
                  <StatusBadge status={membership.status} />
                </View>
              </Row>
              <Button
                title="Leave Zone"
                variant="ghost"
                size="sm"
                fullWidth={false}
                loading={leaving && leavingZone?.id === membership.zone?.id}
                onPress={() => membership.zone && setLeavingZone(membership.zone)}
              />
            </Card>
          ))}
        </View>
      ) : null}

      <Spacer height={8} />
      <PaginatedList
        items={visibleZones}
        pagination={allZones?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        keyExtractor={(item) => item.id}
        renderItem={(zone) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={zone.logo}
                style={{ width: 52, height: 52, borderRadius: radius.full }}
                fallbackText={zone.name}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold">
                  {zone.name}
                </AppText>
                <AppText variant="small" color={colors.textMuted} numberOfLines={2}>
                  {zone.tagline ?? zone.description}
                </AppText>
                <AppText variant="small" color={colors.textSubtle}>
                  {zone.member_count ?? 0} members
                </AppText>
              </View>
            </Row>
            <Button
              title="Apply to Join"
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={() => setApplyZone(zone)}
            />
          </Card>
        )}
        emptyTitle="No zones available"
        emptyDescription="School zones near you will appear here"
        ListHeaderComponent={
          <View style={{ padding: spacing.lg, paddingBottom: 0, gap: spacing.md }}>
            <AppText variant="label" weight="bold">
              Discover Zones
            </AppText>
            <Card padded={false} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
              <Row style={{ gap: spacing.sm }}>
                <Search size={16} color={colors.textSubtle} />
                <TextInput
                  value={browseSearch}
                  onChangeText={setBrowseSearch}
                  placeholder="Search zones…"
                  placeholderTextColor={colors.textSubtle}
                  style={{ flex: 1, fontSize: 14, color: colors.text }}
                />
              </Row>
            </Card>
            <Spacer height={4} />
          </View>
        }
      />

      <AppModal
        visible={Boolean(applyZone)}
        onClose={() => setApplyZone(null)}
        title={`Apply to ${applyZone?.name ?? ''}`}
        footer={<Button title="Submit Application" onPress={handleApply} loading={applying} />}
        scrollable
      >
        <View style={{ gap: spacing.md }}>
          <AppText variant="caption" color={colors.textMuted}>
            Tell the zone about your store to get approved faster.
          </AppText>
          <AppInput
            value={department}
            onChangeText={setDepartment}
            label="Department (optional)"
            placeholder="e.g. Computer Science"
          />
          <AppInput
            value={course}
            onChangeText={setCourse}
            label="Course (optional)"
            placeholder="e.g. Software Engineering"
          />
        </View>
      </AppModal>

      <AppModal
        visible={Boolean(leavingZone)}
        onClose={() => setLeavingZone(null)}
        title={`Leave ${leavingZone?.name ?? ''}?`}
        scrollable={false}
        footer={
          <Button title="Confirm Leave" variant="danger" onPress={handleLeave} loading={leaving} />
        }
      >
        <AppText variant="caption" color={colors.textMuted}>
          Your store will no longer be part of this school zone.
        </AppText>
      </AppModal>
    </View>
  );
}
