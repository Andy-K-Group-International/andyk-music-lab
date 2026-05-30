"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="premium-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <Image src="/logo-3d.png" alt="Andy'K Music Lab" width={140} height={47} priority />
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
