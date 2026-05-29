"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="premium-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="logo-brand">Andy&apos;K</span>
          <span className="logo-pipe">|</span>
          <span className="logo-name">Music Lab</span>
        </Link>

        {/* Center nav — desktop only */}
        <div className="hidden md:flex items-center gap-1">
          <a href="/#tools" className="nav-link">Tools</a>
          <a href="/#pricing" className="nav-link">Pricing</a>
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer" className="nav-link">About</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer"
            className="nav-back-link hidden sm:block">
            ← djandykofficial.com
          </a>
          <div className="w-px h-5 hidden sm:block" style={{ background: "rgba(0,0,0,0.12)" }} />

          <button onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="theme-toggle-btn">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden theme-toggle-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-wrap ${menuOpen ? "open" : ""}`}>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mobile-nav-menu">
          <a href="/#tools" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Tools</a>
          <a href="/#pricing" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer"
            className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            About ↗
          </a>
          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "6px 12px" }} />
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer"
            className="mobile-nav-link" style={{ fontSize: 12, opacity: 0.55 }}
            onClick={() => setMenuOpen(false)}>
            ← djandykofficial.com
          </a>
        </div>
      )}
    </nav>
  );
}
