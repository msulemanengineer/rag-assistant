import type { Source } from "@/types/api";
import { SourceCard } from "./source-card";

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-label="Retrieved sources" className="mt-4">
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Retrieved passages ({sources.length})
      </h4>
      <ul className="space-y-1.5">
        {sources.map((s) => (
          <SourceCard key={`${s.label}-${s.document}-${s.page}`} source={s} />
        ))}
      </ul>
    </section>
  );
}
