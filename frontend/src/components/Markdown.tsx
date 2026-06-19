import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders markdown content (the long-form fields) with GitHub-flavored tables/lists. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
