'use client';

import { PATHS } from '@/routes/paths';
import { useRumsanAppStore } from '@rumsan/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isAuthenticated } = useRumsanAppStore();
  const returnTo = searchParams.get('returnTo');

  const checkIfAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      router.replace(returnTo || PATHS.EXPENSE.HOME);
    }
  }, [isAuthenticated, returnTo, router]);

  useEffect(() => {
    checkIfAuthenticated();
  }, [checkIfAuthenticated]);

  return <>{children}</>;
}
