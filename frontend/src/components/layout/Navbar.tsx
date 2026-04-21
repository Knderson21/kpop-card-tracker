import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link to="/" className="flex items-center" aria-label="KPop Collect home">
          <img src="/KPOPCollect_HorizontalLogo.svg" alt="KPop Collect" className="h-10 w-auto" />
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
          <Link
            to="/admin"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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
