import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAppSelector } from '@/hooks';
import { roleHome } from '@/utils/permissions';

export default function IndexRedirect() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleHome(user.account_type) as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return <Redirect href={isAuthenticated && user ? (roleHome(user.account_type) as never) : '/home'} />;
}
