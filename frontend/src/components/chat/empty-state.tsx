import { FileSearch } from "lucide-react";
import { APP_NAME } from "@/lib/config";

const SUGGESTIONS = [
  "Give me an overview of what these documents cover.",
  "What deadlines or important dates are mentioned?",
  "What are the rules around fees and payments?",
];

export function EmptyState({
  onPick,
  disabled,
  documentCount,
}: {
  onPick: (q: string) => void;
  disabled: boolean;
  documentCount: number | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
      <div className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <FileSearch className="size-5" aria-hidden />
      </div>
      <h2 className="mt-5 text-center text-xl font-semibold tracking-tight">
        Ask {APP_NAME} about your documents
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Answers are written from passages retrieved from your indexed PDFs. Each answer lists
        the passages it was given, with page numbers, so you can check them.
        {documentCount === 0 && " No documents are indexed yet."}
      </p>
      <ul className="mt-7 grid w-full max-w-xl gap-2">
        {SUGGESTIONS.map((q) => (
          <li key={q}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(q)}
              className="w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
