import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { AppImage } from './AppImage';

const MAX_ZOOM = 3;
const DOUBLE_TAP_ZOOM = 2.2;

function isImageUrl(url: string): boolean {
  return !url.toLowerCase().endsWith('.mp4');
}

function ZoomableImage({
  uri,
  fallbackText,
  imageSize,
}: {
  uri: string;
  fallbackText: string;
  imageSize: number;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const [zoomed, setZoomed] = useState(false);

  const syncZoomed = () => {
    'worklet';
    runOnJS(setZoomed)(scale.value > 1.01);
  };

  const resetTransform = () => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedX.value = 0;
    savedY.value = 0;
    runOnJS(setZoomed)(false);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), MAX_ZOOM);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        resetTransform();
      } else {
        syncZoomed();
      }
    });

  const pan = Gesture.Pan()
    .enabled(zoomed)
    .onUpdate((event) => {
      translateX.value = savedX.value + event.translationX;
      translateY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetTransform();
      } else {
        scale.value = withTiming(DOUBLE_TAP_ZOOM);
        savedScale.value = DOUBLE_TAP_ZOOM;
        runOnJS(setZoomed)(true);
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={animatedStyle}>
          <AppImage
            uri={uri}
            style={{ width: imageSize, height: imageSize, borderRadius: 5 }}
            fallbackText={fallbackText}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function ZoomableLightbox({
  visible,
  images,
  initialIndex,
  fallbackText,
  onClose,
}: {
  visible: boolean;
  images: string[];
  initialIndex: number;
  fallbackText: string;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView | null>(null);
  const imageSize = Math.min(width - 32, height - 220);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, visible]);

  useEffect(() => {
    if (visible && scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * width, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(target, images.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(next, images.length - 1)));
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              {
                padding: 14,
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <X size={28} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {images.map((url, imageIndex) => (
            <View key={`${url}-${imageIndex}`} style={{ width, height }}>
              <ZoomableImage
                key={`zoom-${imageIndex}`}
                uri={url}
                fallbackText={fallbackText}
                imageSize={imageSize}
              />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 ? (
          <>
            {index > 0 ? (
              <Pressable
                onPress={() => goTo(index - 1)}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  marginTop: -28,
                  padding: 16,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <ChevronLeft size={30} color="#ffffff" strokeWidth={2.5} />
              </Pressable>
            ) : null}
            {index < images.length - 1 ? (
              <Pressable
                onPress={() => goTo(index + 1)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  marginTop: -28,
                  padding: 16,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <ChevronRight size={30} color="#ffffff" strokeWidth={2.5} />
              </Pressable>
            ) : null}
          </>
        ) : null}

        <View
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            alignItems: 'center',
            gap: 16,
          }}
        >
          {images.length > 1 ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 8,
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              {images.map((url, dotIndex) => (
                <Pressable
                  key={url}
                  onPress={() => goTo(dotIndex)}
                  hitSlop={6}
                  style={{
                    width: dotIndex === index ? 32 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      dotIndex === index ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  }}
                />
              ))}
            </View>
          ) : null}
          <AppText
            style={{ fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}
            color="rgba(255,255,255,0.6)"
          >
            {index + 1} / {images.length}
          </AppText>
        </View>
      </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

export function ProductGallery({
  images,
  fallbackText,
}: {
  images: string[];
  fallbackText: string;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const list = images.filter(isImageUrl);

  if (list.length === 0) {
    return null;
  }

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(target, list.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  };

  const openLightbox = (target: number) => {
    setLightboxIndex(target);
    setLightboxOpen(true);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(next, list.length - 1)));
  };

  return (
    <>
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {list.map((url) => (
            <Pressable key={url} onPress={() => openLightbox(list.indexOf(url))}>
              <AppImage
                uri={url}
                style={{ width, height: width, borderRadius: 0 }}
                fallbackText={fallbackText}
              />
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => openLightbox(index)}
          style={({ pressed }) => [
            {
              position: 'absolute',
              top: 24,
              right: 24,
              padding: 12,
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.5)',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Maximize2 size={16} color="#18181b" strokeWidth={2.5} />
        </Pressable>

        {list.length > 1 ? (
          <View
            style={{
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                padding: 8,
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              {list.map((url, dotIndex) => (
                <Pressable
                  key={url}
                  onPress={() => goTo(dotIndex)}
                  hitSlop={6}
                  style={{
                    width: dotIndex === index ? 32 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      dotIndex === index ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {list.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.md, paddingTop: spacing.lg }}
        >
          {list.map((url, thumbIndex) => (
            <Pressable
              key={url}
              onPress={() => goTo(thumbIndex)}
              style={{
                width: 80,
                height: 80,
                borderRadius: radius.sm,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor:
                  thumbIndex === index ? '#17c06e' : colors.border,
                transform: [{ scale: thumbIndex === index ? 0.95 : 1 }],
              }}
            >
              <AppImage
                uri={url}
                style={{ width: '100%', height: '100%', borderRadius: 0 }}
                fallbackText=""
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <ZoomableLightbox
        visible={lightboxOpen}
        images={list}
        initialIndex={lightboxIndex}
        fallbackText={fallbackText}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
