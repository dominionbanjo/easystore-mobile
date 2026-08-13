import { useEffect } from 'react';
import { View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useGoogleLoginMutation } from '@/api/authApi';
import { getErrorMessage } from '@/utils/error';
import { useToast } from '@/hooks/useToast';
import { roleHome } from '@/utils/permissions';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const GOOGLE_CONFIGURED = Boolean(WEB_CLIENT_ID);

export function GoogleSignInButton() {
  const { colors, spacing } = useAppTheme();

  if (!GOOGLE_CONFIGURED) {
    return (
      <View style={{ alignItems: 'center', padding: spacing.sm }}>
        <AppText variant="small" color={colors.textSubtle} center>
          Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_CLIENT_ID (and
          EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID for Android) in .env to enable it.
        </AppText>
      </View>
    );
  }

  return <GoogleButtonInner />;
}

function GoogleButtonInner() {
  const { radius } = useAppTheme();
  const router = useRouter();
  const toast = useToast();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID ?? WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success' || !response.params.id_token) {
      return;
    }
    (async () => {
      try {
        const data = await googleLogin({ token: response.params.id_token }).unwrap();
        toast.showSuccess(`Welcome, ${data.user.first_name}!`);
        router.replace(roleHome(data.user.account_type) as never);
      } catch (error) {
        toast.showError(getErrorMessage(error));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Button
      title="Continue with Google"
      variant="outline"
      loading={isLoading}
      onPress={() => {
        if (!request) {
          toast.showError('Google sign-in is not ready yet');
          return;
        }
        promptAsync().catch(() => toast.showError('Google sign-in failed'));
      }}
      icon={
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: radius.full,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="logo-google" size={12} color="#4285F4" />
        </View>
      }
    />
  );
}
