import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { useAppSelector } from '@/hooks';
import { roleHome } from '@/utils/permissions';

export default function IndexRedirect() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user) {
        router.replace(roleHome(user.account_type) as never);
      } else {
        router.replace('/home');
      }
    }, [isAuthenticated, user, router]),
  );

  return null;
}
