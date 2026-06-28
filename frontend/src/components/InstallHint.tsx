import { useEffect, useState } from "react";

// Banner discreto que ensina a instalar no iOS (Safari não dispara prompt automático).
// Só aparece no iPhone/iPad, no Safari, quando o app AINDA NÃO está instalado, e some pra sempre ao fechar.
export function InstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("install-hint-dismissed") === "1";
    if (isIOS && !standalone && !dismissed) setShow(true);
  }, []);

  if (!show) return null;
  return (
    <div className="install-hint" role="dialog" aria-label="Instalar o app">
      <span>
        📲 Instale o app: toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
      </span>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem("install-hint-dismissed", "1");
          setShow(false);
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  );
}
