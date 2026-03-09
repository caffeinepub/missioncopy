/**
 * Admin-specific storage client hook.
 * Reuses the StorageClient that is already baked into createActorWithConfig,
 * which uses the properly-configured HttpAgent. This avoids the "Expected v3
 * response body" error that occurs when a separate bare HttpAgent is used for
 * the _caffeineStorageCreateCertificate call.
 */
import { getAdminStorageClient } from "@/config";
import type { StorageClient } from "@/utils/StorageClient";
import { useEffect, useState } from "react";

export function useAdminStorageClient(): StorageClient | null {
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const c = await getAdminStorageClient();
      if (!cancelled) {
        setClient(c);
      }
    }

    init().catch((err) => {
      console.error("useAdminStorageClient init error:", err);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return client;
}
