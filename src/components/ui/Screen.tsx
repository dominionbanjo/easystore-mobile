import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { useAppTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  contentContainerStyle?: object;
  refreshControl?: ReactNode;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  keyboard = false,
  contentContainerStyle,
  refreshControl,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();

  const content = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        padded && { padding: spacing.lg, paddingBottom: spacing.xxl },
        contentContainerStyle,
      ]}
      refreshControl={refreshControl as never}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

  const wrapped = keyboard ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {wrapped}
    </SafeAreaView>
  );
}
