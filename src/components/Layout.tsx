import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useTheme } from "../lib/theme";

export function Layout({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="sticky top-0 z-30 border-b border-border-hairline bg-surface-page/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-[13px] font-medium text-ink-muted sm:inline">
              Controle de Contratos / Medições
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {right}
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-hairline text-ink-secondary hover:bg-surface-card-2"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 py-6">{children}</main>
    </div>
  );
}
