"use client";

import { useState } from "react";

// Camelot Wheel adjacency
// Each key has neighbors: same number other mode (parallel), ±1 number same mode (relative), same (itself)
const CAMELOT_KEYS = [
  "1A","2A","3A","4A","5A","6A","7A","8A","9A","10A","11A","12A",
  "1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B",
];

function camelotNeighbors(key: string): string[] {
  const match = key.match(/^(\d+)(A|B)$/);
  if (!match) return [];
  const num = parseInt(match[1]);
  const mode = match[2];
  const oMode = mode === "A" ? "B" : "A";
  const prev = ((num - 2 + 12) % 12) + 1;
  const next = (num % 12) + 1;
  return [key, `${prev}${mode}`, `${next}${mode}`, `${num}${oMode}`];
}

function compatibility(a: string, b: string): "perfect" | "good" | "risky" {
  if (a === b) return "perfect";
  const neighbors = camelotNeighbors(a);
  if (neighbors.includes(b)) return "good";
  return "risky";
}

const COMPAT_STYLE: Record<string, string> = {
  perfect: "bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] border-[var(--color-highlight)]/30",
  good: "bg-blue-50 text-blue-700 border-blue-200",
  risky: "bg-red-50 text-red-600 border-red-200",
};

const COMPAT_LABEL: Record<string, string> = {
  perfect: "Perfect",
  good: "Good",
  risky: "Clash",
};

interface Track {
  id: string;
  title: string;
  bpm: string;
  camelot: string;
}

function buildHarmonicOrder(tracks: Track[]): Track[] {
  if (tracks.length <= 1) return [...tracks];
  const remaining = [...tracks];
  const ordered: Track[] = [remaining.splice(0, 1)[0]];

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    // Find best next track: perfect > good > risky
    let bestIdx = 0;
    let bestScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const c = compatibility(last.camelot, remaining[i].camelot);
      const score = c === "perfect" ? 3 : c === "good" ? 2 : 1;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  return ordered;
}

let _id = 0;
const uid = () => String(++_id);

const EMPTY_TRACK = (): Track => ({ id: uid(), title: "", bpm: "", camelot: "" });

export default function PlannerClient() {
  const [tracks, setTracks] = useState<Track[]>([EMPTY_TRACK(), EMPTY_TRACK(), EMPTY_TRACK()]);
  const [playlist, setPlaylist] = useState<Track[] | null>(null);

  const updateTrack = (id: string, field: keyof Track, value: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
    setPlaylist(null);
  };

  const addTrack = () => {
    setTracks((prev) => [...prev, EMPTY_TRACK()]);
    setPlaylist(null);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setPlaylist(null);
  };

  const buildPlaylist = () => {
    const valid = tracks.filter((t) => t.title.trim() && t.camelot.trim());
    if (valid.length < 2) return;
    setPlaylist(buildHarmonicOrder(valid));
  };

  const validCount = tracks.filter((t) => t.title.trim() && t.camelot.trim()).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎛️</span>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">DJ Set Planner</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium">
            Free
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Enter your tracks with their Camelot keys. The planner will arrange them in a harmonically
          optimal order using the Camelot Wheel — minimizing key clashes between transitions.
        </p>
      </div>

      {/* Track input table */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-[1fr_80px_80px_32px] gap-3 text-xs font-medium text-[var(--color-muted-2)] uppercase tracking-wider mb-3 px-1">
          <span>Track title</span>
          <span>BPM</span>
          <span>Camelot</span>
          <span />
        </div>

        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="grid grid-cols-[1fr_80px_80px_32px] gap-3 items-center">
              <input
                type="text"
                placeholder="Track name…"
                value={track.title}
                onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-grid-500)] text-sm text-[var(--color-foreground)] bg-transparent focus:outline-none focus:border-[var(--color-highlight)] transition-colors"
              />
              <input
                type="number"
                placeholder="128"
                value={track.bpm}
                onChange={(e) => updateTrack(track.id, "bpm", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-grid-500)] text-sm text-[var(--color-foreground)] bg-transparent focus:outline-none focus:border-[var(--color-highlight)] transition-colors font-mono"
              />
              <select
                value={track.camelot}
                onChange={(e) => updateTrack(track.id, "camelot", e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-[var(--color-grid-500)] text-sm text-[var(--color-foreground)] bg-transparent focus:outline-none focus:border-[var(--color-highlight)] transition-colors font-mono"
              >
                <option value="">—</option>
                {CAMELOT_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <button
                onClick={() => removeTrack(track.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted-2)] hover:text-red-500 hover:bg-red-50 transition-colors text-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addTrack}
          className="mt-4 text-sm text-[var(--color-highlight)] hover:underline flex items-center gap-1"
        >
          + Add track
        </button>
      </div>

      <button
        onClick={buildPlaylist}
        disabled={validCount < 2}
        className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mb-8"
      >
        {validCount < 2 ? `Add at least 2 tracks with Camelot keys` : "Build harmonic playlist"}
      </button>

      {/* Playlist result */}
      {playlist && (
        <div>
          <h2 className="font-semibold text-[var(--color-foreground)] mb-4">
            Harmonic playlist ({playlist.length} tracks)
          </h2>
          <div className="space-y-3">
            {playlist.map((track, i) => {
              const next = playlist[i + 1];
              const compat = next ? compatibility(track.camelot, next.camelot) : null;

              return (
                <div key={track.id}>
                  <div className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
                    <span className="font-mono text-xs text-[var(--color-muted-2)] w-5 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-foreground)] truncate">
                        {track.title}
                      </div>
                      {track.bpm && (
                        <div className="text-xs text-[var(--color-muted-2)] mt-0.5">
                          {track.bpm} BPM
                        </div>
                      )}
                    </div>
                    <span
                      className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                        track.camelot.endsWith("B") ? "camelot-B" : "camelot-A"
                      }`}
                    >
                      {track.camelot}
                    </span>
                  </div>

                  {compat && (
                    <div className="flex items-center gap-2 px-6 py-1.5">
                      <div className="w-px h-4 bg-[var(--color-grid-500)]" />
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${COMPAT_STYLE[compat]}`}
                      >
                        {COMPAT_LABEL[compat]} transition
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs">
            {["perfect", "good", "risky"].map((c) => {
              const count = playlist.slice(0, -1).filter((t, i) => {
                const next = playlist[i + 1];
                return next && compatibility(t.camelot, next.camelot) === c;
              }).length;
              return (
                <div key={c} className={`rounded-xl p-3 border ${COMPAT_STYLE[c]}`}>
                  <div className="text-xl font-bold">{count}</div>
                  <div className="mt-0.5 capitalize">{COMPAT_LABEL[c]} transitions</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Camelot reference */}
      <div className="mt-10 glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
          Camelot Wheel quick reference
        </h3>
        <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
          {CAMELOT_KEYS.map((k) => (
            <span
              key={k}
              className={`px-2 py-1 rounded text-center ${
                k.endsWith("B") ? "camelot-B" : "camelot-A"
              }`}
            >
              {k}
            </span>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted-2)] mt-3">
          A = minor, B = major. Mix within same number or ±1 for harmonic transitions.
        </p>
      </div>
    </div>
  );
}
