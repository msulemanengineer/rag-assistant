"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/chat";
import { MessageItem } from "./message-item";

const NEAR_BOTTOM_PX = 120;

export function MessageList({
  messages,
  onRetry,
  retryDisabled,
}: {
  messages: ChatMessage[];
  onRetry: (id: string) => void;
  retryDisabled: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [away, setAway] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    stick.current = near;
    setAway(!near);
  };

  // A new user message always scrolls down. Otherwise only follow new content
  // if the reader hasn't scrolled up to inspect earlier answers.
  const last = messages[messages.length - 1];
  const lastKey = `${last?.id}:${last?.role === "assistant" ? last.status : ""}`;
  const lastIsUser = last?.role === "user";
  useEffect(() => {
    if (lastIsUser || stick.current) scrollToBottom();
  }, [lastKey, lastIsUser, scrollToBottom]);

  // Switching conversations: jump straight to the end.
  const firstId = messages[0]?.id;
  useEffect(() => {
    stick.current = true;
    scrollToBottom(false);
  }, [firstId, scrollToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scroller} onScroll={onScroll} className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
          {messages.map((m) => (
            <MessageItem key={m.id} message={m} onRetry={onRetry} retryDisabled={retryDisabled} />
          ))}
        </div>
      </div>
      {away && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollToBottom()}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background shadow-md"
        >
          <ArrowDown className="size-3.5" /> Latest
        </Button>
      )}
    </div>
  );
}
