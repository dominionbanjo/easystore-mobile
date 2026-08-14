import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Animated, Modal as RNModal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';

interface DrawerProps {
  visible: boolean;
  onClose?: () => void;
  side?: 'left' | 'right';
  width?: number;
  title?: string;
  dismissible?: boolean;
  children?: ReactNode;
}

/** Side drawer (left/right sheet) — mirrors the web frontend's `Sheet` mobile drawers. */
export function Drawer({
  visible,
  onClose,
  side = 'right',
  width = 280,
  title,
  dismissible = true,
  children,
}: DrawerProps) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(side === 'left' ? -width : width)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(side === 'left' ? -width : width);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, side, width, translateX]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : undefined}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: colors.overlay }}
        onPress={dismissible ? onClose : undefined}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width,
              backgroundColor: colors.surface,
              transform: [{ translateX }],
              paddingTop: Math.max(insets.top, spacing.lg),
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
            side === 'left'
              ? { left: 0 }
              : { right: 0, borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {title ? (
              <AppText variant="subtitle" weight="bold" style={{ flex: 1 }} numberOfLines={1}>
                {title}
              </AppText>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            {dismissible && onClose ? (
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.full,
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
          {children}
        </Animated.View>
      </Pressable>
    </RNModal>
  );
}
