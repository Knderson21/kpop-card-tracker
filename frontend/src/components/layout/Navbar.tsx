import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-3 px-3 sm:gap-6 sm:px-4">
        <Link to="/" className="flex min-w-0 flex-1 items-center" aria-label="KPop Collect home">
          <img
            src="/KPOPCollect_HorizontalLogo.svg"
            alt="KPop Collect"
            className="h-auto w-auto max-h-8 max-w-full sm:max-h-10"
          />
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            to="/"
            className={cn(
              "rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3",
              pathname === "/" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            Home
          </Link>
          <Link
            to="/gallery"
            className={cn(
              "rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3",
              pathname === "/gallery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            Gallery
          </Link>
          <Link
            to="/admin"
            className={cn(
              "rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3",
              pathname === "/admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
