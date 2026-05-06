"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const links = [
    { href: "/mastering", label: "Mastering" },
    { href: "/bpm", label: "BPM + Key" },
    { href: "/planner", label: "DJ Planner" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-[var(--color-grid-500)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--color-deep-teal)] tracking-tight">
            Andy&apos;K
          </span>
          <span className="text-[var(--color-grid-700)] text-sm font-light">|</span>
          <span className="text-sm font-medium text-[var(--color-foreground)]">Music Lab</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === l.href
                  ? "bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-grid-300)]"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-[var(--color-grid-500)] mx-2" />

          <a
            href="https://djandyofficial.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-highlight)] transition-colors px-2 py-1.5"
          >
            djandyofficial.com ↗
          </a>

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-grid-300)] transition-colors"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
