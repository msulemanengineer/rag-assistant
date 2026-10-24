"use client";

import { useId, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@/types/api";

export function SourceCard({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="rounded-lg border bg-background">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-brand-soft font-mono text-[11px] font-medium text-brand">
          {source.label.replace(/[[\]]/g, "")}
        </span>
        <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-medium">{source.document}</span>
        <span className="shrink-0 text-muted-foreground">p. {source.page}</span>
        <span
          className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline"
          title="Cosine similarity between the question and this passage. A ranking signal, not a measure of correctness."
        >
          sim {source.similarity.toFixed(3)}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div id={panelId} hidden={!open} className="border-t px-3 py-2.5">
        <p className="mb-1.5 text-xs text-muted-foreground sm:hidden">
          Similarity {source.similarity.toFixed(3)}
        </p>
        <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words text-[13px] leading-relaxed text-muted-foreground">
          {source.text}
        </p>
      </div>
    </li>
  );
}
