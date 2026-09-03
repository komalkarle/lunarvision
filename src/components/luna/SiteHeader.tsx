import { Link } from "@tanstack/react-router";
import { Moon } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/registration", label: "Image Registration" },
  { to: "/results", label: "Results" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-surface">
            <Moon className="size-4 text-primary" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">LunaMatch</span>
            <span className="label-meta">Lunar Image Correspondence</span>
          </span>
        </Link>

        <nav className="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
