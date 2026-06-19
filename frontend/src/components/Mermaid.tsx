import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" });

let counter = 0;

/** Renders a Mermaid diagram from source, with a graceful error fallback showing the raw code. */
export function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const id = `mermaid-${counter++}`;
    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (alive && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="mermaid-error">
        <p>Não foi possível renderizar o diagrama ({error}). Código-fonte:</p>
        <pre>{code}</pre>
      </div>
    );
  }
  return <div className="mermaid" ref={ref} />;
}
