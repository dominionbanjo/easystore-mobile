import { Modal as RNModal, Pressable, View, ScrollView, Platform } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';
import { Button } from './Button';

interface AppModalProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  dismissible?: boolean;
  sheet?: boolean;
}

export function AppModal({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  scrollable = true,
  dismissible = true,
  sheet = false,
}: AppModalProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const insets = useSafeAreaInsets();

  const body = scrollable ? (
    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : undefined}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: sheet ? 'flex-end' : 'center',
          padding: sheet ? 0 : spacing.lg,
        }}
        onPress={dismissible ? onClose : undefined}
      >
        <Pressable
          style={{
            backgroundColor: colors.surface,
            borderRadius: sheet ? 0 : radius.lg,
            borderTopLeftRadius: sheet ? radius.lg : 0,
            borderTopRightRadius: sheet ? radius.lg : 0,
            padding: spacing.lg,
            gap: spacing.md,
            maxHeight: '85%',
            paddingBottom: sheet ? Math.max(insets.bottom, spacing.lg) : spacing.lg,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          {title ? (
            <View style={{ gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <AppText variant="subtitle" weight="bold" style={{ flex: 1 }}>
                  {title}
                </AppText>
                {dismissible && onClose ? (
                  <Pressable
                    onPress={onClose}
                    hitSlop={10}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppText style={{ fontSize: typography.lg }} color={colors.textMuted}>
                      ✕
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
              {description ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {description}
                </AppText>
              ) : null}
            </View>
          ) : null}
          {body}
          {footer ? <View style={{ marginTop: spacing.sm }}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { spacing } = useAppTheme();
  return (
    <AppModal
      visible={visible}
      onClose={loading ? undefined : onCancel}
      title={title}
      description={message}
      dismissible={!loading}
      scrollable={false}
      footer={
        <View
          style={{
            flexDirection: Platform.OS === 'ios' ? 'row' : 'column',
            gap: spacing.sm,
          }}
        >
          <Button
            title={cancelText}
            variant="outline"
            onPress={onCancel}
            disabled={loading}
            style={Platform.OS === 'ios' ? { flex: 1 } : undefined}
          />
          <Button
            title={confirmText}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            style={Platform.OS === 'ios' ? { flex: 1 } : undefined}
          />
        </View>
      }
    />
  );
}
