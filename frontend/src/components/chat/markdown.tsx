import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown does not render raw HTML by default and strips unsafe URLs,
// so model output can't inject markup or script.
const components: Components = {
  p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
  h1: (props) => <h3 className="mt-4 mb-1 text-base font-semibold" {...props} />,
  h2: (props) => <h3 className="mt-4 mb-1 text-base font-semibold" {...props} />,
  h3: (props) => <h4 className="mt-3 mb-1 font-semibold" {...props} />,
  a: (props) => (
    <a
      className="rounded-sm text-brand underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" {...props} />
  ),
  pre: (props) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-sm" {...props} />
  ),
  table: (props) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b bg-muted/60 px-3 py-2 text-left font-medium" {...props} />
  ),
  td: (props) => <td className="border-b px-3 py-2 align-top" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-2 border-l-2 pl-3 text-muted-foreground" {...props} />
  ),
};

// Models often emit <br> inside table cells. Raw HTML is not rendered, so show
// a space instead of the literal tag.
const stripBreaks = (text: string) => text.replace(/<br\s*\/?>/gi, " ");

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {stripBreaks(children)}
    </ReactMarkdown>
  );
}
