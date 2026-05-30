"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/lib/translations";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

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
          <a href="/#tools" className="nav-link">{t.nav.tools}</a>
          <a href="/#pricing" className="nav-link">{t.nav.pricing}</a>
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer" className="nav-link">{t.nav.about}</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Language select */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label="Select language"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: "transparent",
              border: "1px solid rgba(0,0,0,0.18)",
              color: "#111111",
              padding: "3px 6px",
              cursor: "pointer",
              outline: "none",
              borderRadius: 4,
            }}
          >
            <option value="en">EN</option>
            <option value="sk">SK</option>
            <option value="de">DE</option>
            <option value="es">ES</option>
          </select>

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
          <a href="/#tools" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{t.nav.tools}</a>
          <a href="/#pricing" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{t.nav.pricing}</a>
          <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer"
            className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            {t.nav.about} ↗
          </a>
          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "6px 12px" }} />
          {/* Language picker — mobile */}
          <div style={{ display: "flex", gap: 8, padding: "8px 16px" }}>
            {(["en", "sk", "de", "es"] as Locale[]).map(l => (
              <button
                key={l}
                onClick={() => { setLocale(l); setMenuOpen(false); }}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  background: locale === l ? "#111111" : "transparent",
                  color: locale === l ? "#ffffff" : "#525252",
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
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
