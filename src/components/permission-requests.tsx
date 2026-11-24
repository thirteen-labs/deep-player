import { useEffect } from 'react';

import { requestMissingPermissions } from '@/lib/permissions';

/** Requests any missing runtime permissions once when the app opens. */
export function PermissionRequests() {
  useEffect(() => {
    void requestMissingPermissions();
  }, []);

  return null;
}
