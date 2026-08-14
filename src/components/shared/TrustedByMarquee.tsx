import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '../ui/Text';
import type { IStore } from '@/types/store';

export function TrustedByMarquee({ stores }: { stores: IStore[] }) {
  const { colors } = useAppTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const contentWidth = useRef(0);

  useEffect(() => {
    if (contentWidth.current <= 0) {
      return;
    }
    const distance = contentWidth.current / 2;
    const duration = Math.max(20000, distance * 40);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX, stores.length]);

  const items = stores.length > 0 ? stores : [];
  const display = items.length > 0 ? items : [];
  const doubled = [...display, ...display];

  if (doubled.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingVertical: 32, alignItems: 'center', gap: 12, overflow: 'hidden' }}>
      <AppText style={{ fontSize: 24, letterSpacing: -0.5 }} weight="bold" center>
        Powering 40,000+ Growing Brands
      </AppText>
      <AppText variant="small" color={colors.textMuted} center>
        From local startups to established enterprises, these businesses trust eazystore to scale
        their digital commerce.
      </AppText>
      <View style={{ width: '100%', marginTop: 12, overflow: 'hidden', paddingHorizontal: 16 }}>
        <Animated.View
          onLayout={(event) => {
            contentWidth.current = event.nativeEvent.layout.width;
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateX }],
          }}
        >
          {doubled.map((store, index) => (
            <View
              key={`${store.id}-${index}`}
              style={{
                height: 56,
                paddingHorizontal: 28,
                marginRight: 12,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText style={{ fontSize: 18, fontStyle: 'italic', opacity: 0.8 }} weight="bold" color={colors.textMuted}>
                {store.store_name}
              </AppText>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
