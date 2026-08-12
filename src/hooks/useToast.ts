import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks';
import { addToast } from '@/features/uiSlice';

export function useToast() {
  const dispatch = useAppDispatch();
  const showSuccess = useCallback(
    (message: string) => dispatch(addToast({ message, type: 'success' })),
    [dispatch],
  );
  const showError = useCallback(
    (message: string) => dispatch(addToast({ message, type: 'error' })),
    [dispatch],
  );
  const showInfo = useCallback(
    (message: string) => dispatch(addToast({ message, type: 'info' })),
    [dispatch],
  );
  return { showSuccess, showError, showInfo };
}
