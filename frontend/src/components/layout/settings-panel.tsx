"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import type { BackendStatus } from "@/hooks/use-backend-status";
import { ThemeToggle } from "./theme-toggle";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right font-mono text-xs">{value}</dd>
    </div>
  );
}

export function SettingsPanel({
  open,
  onOpenChange,
  status,
  onRefresh,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: BackendStatus;
  onRefresh: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Appearance and connection details.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <section>
            <h3 className="mb-2 text-sm font-medium">Appearance</h3>
            <ThemeToggle />
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-medium">Backend</h3>
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                Re-check
              </Button>
            </div>
            <dl className="divide-y">
              <Row label="API URL" value={API_BASE_URL} />
              {status.state === "loading" && <Row label="Status" value="Checking…" />}
              {status.state === "offline" && <Row label="Status" value="Unreachable" />}
              {status.state === "ready" && (
                <>
                  <Row label="Status" value={status.health.status} />
                  <Row label="Index built" value={status.health.index_ready ? "yes" : "no"} />
                  <Row
                    label="LLM key configured"
                    value={status.health.llm_configured ? "yes" : "no"}
                  />
                  <Row label="Embedding model" value={status.documents.embedding_model ?? "unknown"} />
                  <Row label="Indexed chunks" value={String(status.documents.total_chunks)} />
                </>
              )}
            </dl>
            {status.state === "offline" && (
              <p className="mt-2 text-sm text-muted-foreground">{status.message}</p>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
