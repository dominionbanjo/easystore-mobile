import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { AppModal, ConfirmDialog } from '@/components/ui/Modal';
import { AppInput } from '@/components/ui/Input';
import {
  useGetStaffQuery,
  useInviteStaffMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useResetStaffPasswordMutation,
  useDeleteStaffMutation,
  useUpdateStaffPermissionsMutation,
} from '@/api/staffApi';
import { ALL_PERMISSION_CODES } from '@/constants/permissions';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import type { IStaffMember } from '@/types/staff';
import type { PermissionCode } from '@/constants/permissions';

export default function VendorStaffScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetStaffQuery({ page, limit: 20 });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<PermissionCode[]>(['product:view', 'order:view', 'order:manage']);
  const [invite, { isLoading: inviting }] = useInviteStaffMutation();

  const [selectedStaff, setSelectedStaff] = useState<IStaffMember | null>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState<PermissionCode[]>([]);
  const [updatePermissions, { isLoading: updatingPermissions }] = useUpdateStaffPermissionsMutation();

  const [suspend] = useSuspendStaffMutation();
  const [unsuspend] = useUnsuspendStaffMutation();
  const [resetPassword] = useResetStaffPasswordMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [deleteTarget, setDeleteTarget] = useState<IStaffMember | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.showError('Enter the staff email');
      return;
    }
    try {
      await invite({ email: inviteEmail.trim(), permissions: invitePermissions }).unwrap();
      toast.showSuccess('Invitation sent');
      setInviteModalOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const openPermissions = (staff: IStaffMember) => {
    setSelectedStaff(staff);
    setStaffPermissions(staff.permissions ?? []);
    setPermissionsModalOpen(true);
  };

  const togglePermission = (permission: PermissionCode) => {
    setStaffPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) {
      return;
    }
    try {
      await updatePermissions({ id: selectedStaff.id, permissions: staffPermissions }).unwrap();
      toast.showSuccess('Permissions updated');
      setPermissionsModalOpen(false);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleSuspendToggle = async (staff: IStaffMember) => {
    try {
      if (staff.status === 'suspended') {
        await unsuspend(staff.id).unwrap();
        toast.showSuccess('Staff reactivated');
      } else {
        await suspend(staff.id).unwrap();
        toast.showSuccess('Staff suspended');
      }
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleResetPassword = async (staff: IStaffMember) => {
    try {
      await resetPassword(staff.id).unwrap();
      toast.showSuccess('Password reset link sent');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteStaff(deleteTarget.id).unwrap();
      toast.showSuccess('Staff removed');
      setDeleteTarget(null);
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Button title="Invite Staff" onPress={() => setInviteModalOpen(true)} size="sm" fullWidth={false} />
      </View>
      <Spacer height={8} />
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(staff) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm }}>
            <Row style={{ gap: spacing.md }}>
              <AppImage
                uri={staff.user.avatar}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                fallbackText={`${staff.user.first_name[0] ?? ''}${staff.user.last_name[0] ?? ''}`}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="semibold">
                  {staff.user.first_name} {staff.user.last_name}
                </AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {staff.user.email}
                </AppText>
                <Row style={{ gap: spacing.xs }}>
                  <StatusBadge status={staff.status} />
                  {staff.permissions?.length ? (
                    <AppText variant="small" color={colors.textSubtle}>
                      {staff.permissions.length} permission(s)
                    </AppText>
                  ) : null}
                </Row>
              </View>
            </Row>
            <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
              <Button title="Permissions" variant="outline" size="sm" fullWidth={false} onPress={() => openPermissions(staff)} />
              <Button
                title={staff.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => handleSuspendToggle(staff)}
              />
              <Button title="Reset Password" variant="ghost" size="sm" fullWidth={false} onPress={() => handleResetPassword(staff)} />
              <Button title="Remove" variant="ghost" size="sm" fullWidth={false} onPress={() => setDeleteTarget(staff)} />
            </Row>
          </Card>
        )}
        emptyTitle="No staff yet"
        emptyDescription="Invite staff to help manage your store"
      />

      <AppModal
        visible={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Staff"
        footer={<Button title="Send Invite" onPress={handleInvite} loading={inviting} />}
        scrollable
      >
        <View style={{ gap: spacing.md }}>
          <AppInput
            value={inviteEmail}
            onChangeText={setInviteEmail}
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="staff@example.com"
          />
          <AppText variant="label" weight="medium" color={colors.textMuted}>
            Permissions
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {ALL_PERMISSION_CODES.map((permission) => (
              <Button
                key={permission}
                title={permission}
                variant={invitePermissions.includes(permission) ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() =>
                  setInvitePermissions((current) =>
                    current.includes(permission)
                      ? current.filter((item) => item !== permission)
                      : [...current, permission],
                  )
                }
              />
            ))}
          </View>
        </View>
      </AppModal>

      <AppModal
        visible={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        title={`Permissions · ${selectedStaff?.user.first_name ?? ''}`}
        footer={<Button title="Save Permissions" onPress={handleSavePermissions} loading={updatingPermissions} />}
        scrollable
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {ALL_PERMISSION_CODES.map((permission) => (
            <Button
              key={permission}
              title={permission}
              variant={staffPermissions.includes(permission) ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              onPress={() => togglePermission(permission)}
            />
          ))}
        </View>
      </AppModal>

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title={`Remove ${deleteTarget?.user.first_name ?? ''}?`}
        message="They will lose access to your store immediately."
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
