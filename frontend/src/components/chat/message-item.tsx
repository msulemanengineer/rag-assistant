import { AlertCircle, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/types/chat";
import { Markdown } from "./markdown";
import { SourceList } from "./source-list";

function Pending() {
  return (
    <div role="status" aria-live="polite" className="space-y-2.5 pt-1">
      <span className="sr-only">Searching documents and writing an answer…</span>
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-2/3" />
    </div>
  );
}

export function MessageItem({
  message,
  onRetry,
  retryDisabled,
}: {
  message: ChatMessage;
  onRetry: (id: string) => void;
  retryDisabled: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px]">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-white"
        aria-hidden
      >
        <Sparkles className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1 break-words text-[15px] leading-relaxed">
        {message.status === "pending" && <Pending />}

        {message.status === "error" && message.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0 flex-1">
              <p>{message.error.message}</p>
              {message.error.retryable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={retryDisabled}
                  onClick={() => onRetry(message.id)}
                >
                  <RotateCw className="size-3.5" /> Try again
                </Button>
              )}
            </div>
          </div>
        )}

        {message.status === "done" && (
          <>
            <Markdown>{message.content}</Markdown>
            <SourceList sources={message.sources} />
            {message.model && (
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                {message.model}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
