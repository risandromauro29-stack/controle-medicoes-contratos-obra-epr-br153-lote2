import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border-hairline bg-surface-card px-3 py-2 text-[13px] font-medium text-ink-primary hover:bg-surface-card-2"
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] tabular-nums text-brand-strong">
            {selected.length}
          </span>
        )}
        <span className="text-ink-muted">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-xl border border-border-hairline bg-surface-card p-1.5 shadow-lg">
          {options.length === 0 && (
            <p className="px-2 py-1.5 text-[13px] text-ink-muted">Sem opções</p>
          )}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-primary hover:bg-surface-card-2"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-[var(--brand)]"
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-[12.5px] text-ink-muted hover:bg-surface-card-2"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
