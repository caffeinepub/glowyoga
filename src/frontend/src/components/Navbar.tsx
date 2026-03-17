import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const navLinks = [
    { to: "/" as const, label: "Home" },
    { to: "/exercises" as const, label: "Exercises" },
    { to: "/session" as const, label: "Sessions" },
    { to: "/dashboard" as const, label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" data-ocid="nav.link">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3C9 3 7 4 7 7C7 9 8 10 9 10.5C8.5 11 8 12 8 13.5C8 15.5 9 17 10 17C11 17 12 15.5 12 13.5C12 12 11.5 11 11 10.5C12 10 13 9 13 7C13 4 11 3 10 3Z"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <circle cx="7" cy="7" r="1.5" fill="white" opacity="0.6" />
              <circle cx="13" cy="7" r="1.5" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-foreground text-base leading-tight">
              GlowYoga
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight font-body">
              Face Wellness
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.to ||
              (link.to !== "/" && pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                data-ocid="nav.link"
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div>
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 font-body"
              onClick={clear}
              data-ocid="nav.button"
            >
              <User className="w-4 h-4 mr-2" />
              My Account
            </Button>
          ) : (
            <button
              type="button"
              className="pill-btn flex items-center gap-2"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.primary_button"
            >
              <User className="w-4 h-4" />
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
