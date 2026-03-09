/**
 * Admin-specific storage client hook.
 * Uses loadConfig() from config.ts – the same source of truth that the actor
 * agent uses – so the v3 certified response always comes back correctly.
 * This fixes "Expected v3 response body" on upload and delete.
 */
import { loadConfig } from "@/config";
import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";

export function useAdminStorageClient(
  _bucket = "default",
): StorageClient | null {
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const config = await loadConfig();

      const canisterId = config.backend_canister_id;
      if (!canisterId) {
        console.error(
          "useAdminStorageClient: backend canister ID not available",
        );
        return;
      }

      const agent = new HttpAgent({
        host: config.backend_host,
      });

      // Only fetch root key on local replica (not mainnet).
      if (
        config.backend_host?.includes("localhost") ||
        config.backend_host?.includes("127.0.0.1")
      ) {
        try {
          await agent.fetchRootKey();
        } catch (err) {
          console.warn("fetchRootKey failed:", err);
        }
      }

      if (!cancelled) {
        setClient(
          new StorageClient(
            _bucket,
            config.storage_gateway_url,
            canisterId,
            config.project_id,
            agent,
          ),
        );
      }
    }

    init().catch((err) => {
      console.error("useAdminStorageClient init error:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [_bucket]);

  return client;
}
