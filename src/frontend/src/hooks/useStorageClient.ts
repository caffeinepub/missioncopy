import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";

interface EnvConfig {
  backend_canister_id: string;
  project_id?: string;
}

// Fetch env.json at runtime so we always get the real canister ID
// (not a stale build-time injection that may be empty)
async function loadEnvConfig(): Promise<EnvConfig> {
  try {
    const res = await fetch("/env.json");
    if (!res.ok) throw new Error("Failed to load env.json");
    const json = (await res.json()) as EnvConfig;
    return json;
  } catch {
    // Fallback to build-time env vars if fetch fails
    const canisterId = (import.meta.env.CANISTER_ID_BACKEND as string) || "";
    return { backend_canister_id: canisterId };
  }
}

const STORAGE_GATEWAY_URL =
  (import.meta.env.STORAGE_GATEWAY_URL as string) || "https://blob.caffeine.ai";

export function useStorageClient(_bucket = "default"): StorageClient | null {
  const { identity } = useInternetIdentity();
  const [client, setClient] = useState<StorageClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const config = await loadEnvConfig();
      const canisterId =
        config.backend_canister_id !== "undefined"
          ? config.backend_canister_id
          : (import.meta.env.CANISTER_ID_BACKEND as string) || "";
      const projectId = canisterId;

      if (!canisterId) {
        console.error("useStorageClient: backend canister ID is not available");
        return;
      }

      const agentOptions: Record<string, unknown> = {
        host: "https://ic0.app",
      };
      if (identity) {
        agentOptions.identity = identity;
      }
      const agent = new HttpAgent(agentOptions);

      if (!cancelled) {
        setClient(
          new StorageClient(
            _bucket,
            STORAGE_GATEWAY_URL,
            canisterId,
            projectId,
            agent,
          ),
        );
      }
    }

    init().catch((err) => {
      console.error("useStorageClient init error:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [_bucket, identity]);

  return client;
}
