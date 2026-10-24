"use client";

import type { Conversation } from "@/types/chat";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageList } from "./message-list";

export function ChatPanel({
  conversation,
  pending,
  documentCount,
  onSend,
  onRetry,
}: {
  conversation: Conversation;
  pending: boolean;
  documentCount: number | null;
  onSend: (text: string) => void;
  onRetry: (messageId: string) => void;
}) {
  const empty = conversation.messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {empty ? (
        <EmptyState onPick={onSend} disabled={pending} documentCount={documentCount} />
      ) : (
        <MessageList
          messages={conversation.messages}
          onRetry={onRetry}
          retryDisabled={pending}
        />
      )}
      <Composer onSend={onSend} pending={pending} />
    </div>
  );
}
