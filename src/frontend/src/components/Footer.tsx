import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-warmBrown-700 text-cream-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="font-display font-bold text-2xl text-cream-100 mb-3">
              GlowYoga
            </div>
            <p className="text-cream-200/70 text-sm font-body leading-relaxed max-w-xs">
              Transform your face naturally with ancient yoga techniques. Lift,
              tone, and glow from within.
            </p>
          </div>
          <div>
            <div className="font-body font-semibold text-cream-200/90 text-sm mb-3 uppercase tracking-wide">
              Practice
            </div>
            <ul className="space-y-2">
              {[
                { to: "/exercises" as const, label: "Exercise Library" },
                { to: "/session" as const, label: "Start Session" },
                { to: "/dashboard" as const, label: "My Dashboard" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-cream-200/60 hover:text-cream-100 text-sm font-body transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-body font-semibold text-cream-200/90 text-sm mb-3 uppercase tracking-wide">
              Target Areas
            </div>
            <ul className="space-y-2">
              {[
                "Forehead",
                "Eyes",
                "Cheeks",
                "Jawline",
                "Neck",
                "Full Face",
              ].map((area) => (
                <li key={area}>
                  <Link
                    to="/exercises"
                    className="text-cream-200/60 hover:text-cream-100 text-sm font-body transition-colors"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-cream-100/10 mt-8 pt-8 text-center">
          <p className="text-cream-200/50 text-sm font-body">
            © {year}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caramel-400 hover:text-caramel-400/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
