import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useMemo } from "react";

// We read these from the environment or use fallbacks
const getEnvConfig = () => {
  // These are injected by vite-plugin-environment
  const storageGatewayUrl =
    (import.meta.env.STORAGE_GATEWAY_URL as string) ||
    "https://blob.caffeine.ai";
  const backendCanisterId =
    (import.meta.env.CANISTER_ID_BACKEND as string) || "";
  const projectId = (import.meta.env.CANISTER_ID_BACKEND as string) || "";

  return { storageGatewayUrl, backendCanisterId, projectId };
};

export function useStorageClient(_bucket = "default"): StorageClient {
  const client = useMemo(() => {
    const { storageGatewayUrl, backendCanisterId, projectId } = getEnvConfig();

    const agent = new HttpAgent({
      host: "https://ic0.app",
    });

    return new StorageClient(
      _bucket,
      storageGatewayUrl,
      backendCanisterId,
      projectId,
      agent,
    );
  }, [_bucket]);

  return client;
}
