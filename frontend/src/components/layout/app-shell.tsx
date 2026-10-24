"use client";

import { useState } from "react";
import { Menu, WifiOff } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useConversations } from "@/hooks/use-conversations";
import { APP_NAME } from "@/lib/config";
import { SettingsPanel } from "./settings-panel";
import { Sidebar } from "./sidebar";

export function AppShell() {
  const { status, refresh } = useBackendStatus();
  const chat = useConversations();
  const [navOpen, setNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sidebar = (closeAfter: boolean) => (
    <Sidebar
      status={status}
      conversations={chat.recent}
      activeId={chat.active.id}
      onNewChat={() => {
        chat.startNew();
        if (closeAfter) setNavOpen(false);
      }}
      onSelect={(id) => {
        chat.select(id);
        if (closeAfter) setNavOpen(false);
      }}
      onOpenSettings={() => {
        setNavOpen(false);
        setSettingsOpen(true);
      }}
    />
  );

  const documentCount = status.state === "ready" ? status.documents.documents.length : null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r md:block lg:w-72">{sidebar(false)}</aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0 data-[side=left]:w-72">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {sidebar(true)}
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-[15px] font-semibold tracking-tight">{APP_NAME}</span>
        </header>

        {status.state === "offline" && (
          <div
            role="alert"
            className="flex items-center gap-2 border-b bg-destructive/5 px-4 py-2 text-sm"
          >
            <WifiOff className="size-4 shrink-0 text-destructive" aria-hidden />
            <span className="min-w-0 flex-1">{status.message}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        <ChatPanel
          conversation={chat.active}
          pending={chat.isPending}
          documentCount={documentCount}
          onSend={chat.send}
          onRetry={chat.retry}
        />
      </main>

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        status={status}
        onRefresh={refresh}
      />
    </div>
  );
}
