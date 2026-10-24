"use client";

import { FileText, MessageSquare, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { BackendStatus } from "@/hooks/use-backend-status";
import type { Conversation } from "@/types/chat";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function Documents({ status }: { status: BackendStatus }) {
  if (status.state === "loading") {
    return <Skeleton className="mx-2 h-9" />;
  }
  if (status.state === "offline") {
    return <p className="px-2 text-sm text-muted-foreground">Couldn&apos;t load documents.</p>;
  }
  const { documents } = status.documents;
  if (documents.length === 0) {
    return <p className="px-2 text-sm text-muted-foreground">No documents indexed.</p>;
  }
  return (
    <ul className="space-y-0.5">
      {documents.map((d) => (
        <li key={d.name} className="flex items-start gap-2 rounded-md px-2 py-1.5">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm" title={d.name}>
              {d.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {d.page_count} pages with text · {d.chunk_count} chunks
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar({
  status,
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onOpenSettings,
}: {
  status: BackendStatus;
  conversations: Conversation[];
  activeId: string;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
          {APP_NAME[0]}
        </div>
        <span className="text-[15px] font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <div className="px-3 py-2">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onNewChat}>
          <Plus className="size-4" /> New chat
        </Button>
      </div>

      <nav aria-label="Sidebar" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-2 py-3">
        <section>
          <SectionTitle>Documents</SectionTitle>
          <Documents status={status} />
        </section>

        {conversations.length > 0 && (
          <section>
            <SectionTitle>This session</SectionTitle>
            <ul className="space-y-0.5">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={c.id === activeId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
                      c.id === activeId && "bg-muted font-medium",
                    )}
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{c.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </nav>

      <div className="border-t p-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Settings className="size-4 text-muted-foreground" aria-hidden /> Settings
        </button>
      </div>
    </div>
  );
}
