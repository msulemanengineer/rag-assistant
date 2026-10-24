"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MAX_QUESTION_LENGTH = 2000; // mirrors the backend's validation

export function Composer({
  onSend,
  pending,
}: {
  onSend: (text: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !pending;

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/30"
      >
        <textarea
          ref={ref}
          value={value}
          rows={1}
          maxLength={MAX_QUESTION_LENGTH}
          aria-label="Ask a question about your documents"
          placeholder="Ask a question about your documents…"
          onChange={(e) => {
            setValue(e.target.value);
            grow(e.target);
          }}
          onKeyDown={onKeyDown}
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={pending ? "Waiting for answer" : "Send question"}
          className="size-9 shrink-0 rounded-xl"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </Button>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
        Enter to send · Shift+Enter for a new line. Answers can be wrong; check the retrieved
        passages.
      </p>
    </div>
  );
}
