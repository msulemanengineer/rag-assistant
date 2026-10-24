"use client";

import { useCallback, useEffect, useState } from "react";
import { getDocuments, getHealth } from "@/lib/api";
import type { DocumentsResponse, HealthResponse } from "@/types/api";

export type BackendStatus =
  | { state: "loading" }
  | { state: "offline"; message: string }
  | { state: "ready"; health: HealthResponse; documents: DocumentsResponse };

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({ state: "loading" });

  const refresh = useCallback(async () => {
    try {
      const [health, documents] = await Promise.all([getHealth(), getDocuments()]);
      setStatus({ state: "ready", health, documents });
    } catch (err) {
      setStatus({
        state: "offline",
        message: err instanceof Error ? err.message : "Backend unavailable.",
      });
    }
  }, []);

  useEffect(() => {
    // Fetch once on mount; setState happens after the awaited response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  return { status, refresh };
}
