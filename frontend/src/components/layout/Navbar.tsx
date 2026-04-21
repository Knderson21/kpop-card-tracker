import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { STATIC_MODE } from "../../api/client";

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3" aria-label="KPop Collect home">
          <img src={`${import.meta.env.BASE_URL}KPOPCollect_HorizontalLogo.svg`} alt="KPop Collect" className="h-10 w-auto" />
          {STATIC_MODE && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Demo
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === "/" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            Gallery
          </Link>
          {!STATIC_MODE && (
            <Link
              to="/admin"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
