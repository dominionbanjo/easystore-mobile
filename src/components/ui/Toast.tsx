import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { removeToast } from '@/features/uiSlice';
import { useAppTheme } from '@/theme';
import { AppText } from './Text';

const TOAST_DURATION = 3200;

export function ToastHost() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();
  const { spacing } = useAppTheme();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 60,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 1000,
        gap: spacing.sm,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDone={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </View>
  );
}

function ToastItem({
  message,
  type,
  onDone,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onDone: () => void;
}) {
  // eslint-disable-next-line react-hooks/refs
  const opacity = useRef(new Animated.Value(0)).current;
  // eslint-disable-next-line react-hooks/refs
  const translateY = useRef(new Animated.Value(-16)).current;
  const { colors, radius, spacing } = useAppTheme();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -16, duration: 200, useNativeDriver: true }),
      ]).start(() => onDone());
    }, TOAST_DURATION);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backgroundColor =
    type === 'success' ? colors.success : type === 'error' ? colors.danger : colors.info;

  return (
    <Animated.View
      /* eslint-disable react-hooks/refs */
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderLeftWidth: 4,
          borderLeftColor: backgroundColor,
          padding: spacing.md,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      /* eslint-enable react-hooks/refs */
    >
      <AppText variant="label" weight="medium">
        {message}
      </AppText>
    </Animated.View>
  );
}
