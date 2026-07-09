import { useState } from "react";

/**
 * Tenta carregar /logo.png (arquivo real da marca, a ser colocado em public/).
 * Sem o arquivo, cai para um monograma tipográfico como placeholder.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/logo.png"
        alt="Tucumann"
        className={compact ? "h-8 w-auto" : "h-9 w-auto"}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-white"
        style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-strong))" }}
      >
        T
      </div>
      {!compact && (
        <span className="text-sm font-black tracking-[0.14em] text-ink-primary">TUCUMANN</span>
      )}
    </div>
  );
}
