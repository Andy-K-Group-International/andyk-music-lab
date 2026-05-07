"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "idle" | "loading" | "analyzing" | "eq" | "limiting" | "encoding" | "done" | "error";
type Intensity = "low" | "medium" | "high";
type StereoWidth = "narrow" | "standard" | "wide";
type NoiseLevel = "low" | "medium" | "high";
type Platform = "spotify" | "apple" | "youtube";

interface Analysis {
  bpm: number;
  keyNote: string;
  keyMode: string;
  pitch: string;
  danceability: number;
  lufs: number;
  peak: number;
  dr: number;
}

interface BufferStats { lufs: number; peak: number; dr: number; }

interface MasteringResult {
  blob: Blob;
  masteredUrl: string;
  masteredBuffer: AudioBuffer;
  statsOut: BufferStats;
}

interface Metadata { title: string; artist: string; album: string; year: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<Stage, string> = {
  idle: "", loading: "Loading audio…", analyzing: "Analyzing track…",
  eq: "Applying EQ…", limiting: "Limiting & normalizing…", encoding: "Encoding WAV…",
  done: "Done!", error: "Error",
};
const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0, loading: 10, analyzing: 30, eq: 55, limiting: 75, encoding: 90, done: 100, error: 0,
};
const PLATFORM_LUFS: Record<Platform, number> = { spotify: -14, apple: -16, youtube: -14 };
const INTENSITY_OFFSET: Record<Intensity, number> = { low: -4, medium: 0, high: 3 };
const STEREO_FACTOR: Record<StereoWidth, number> = { narrow: 0.45, standard: 1.0, wide: 1.75 };
const NOISE_CUTOFF: Record<NoiseLevel, number> = { low: 30, medium: 60, high: 100 };

// ─── Audio utilities ──────────────────────────────────────────────────────────

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
function fmtBytes(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function computeStats(buf: AudioBuffer): BufferStats {
  let sumSq = 0, total = 0, peak = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) {
      const a = Math.abs(d[i]);
      if (a > peak) peak = a;
      sumSq += d[i] * d[i];
      total++;
    }
  }
  const rms = Math.sqrt(sumSq / total);
  const lufs = 20 * Math.log10(Math.max(rms, 1e-10)) - 0.691;
  const peakDB = 20 * Math.log10(Math.max(peak, 1e-10));
  return { lufs, peak: peakDB, dr: peakDB - lufs };
}

// Krumhansl–Schmuckler key detection
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MAJ_P = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MIN_P = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function corrProfile(ch: number[], pf: number[]) {
  const mc = ch.reduce((a, b) => a + b, 0) / 12, mp = pf.reduce((a, b) => a + b, 0) / 12;
  let n = 0, dc = 0, dp = 0;
  for (let i = 0; i < 12; i++) { const cc = ch[i] - mc, pp = pf[i] - mp; n += cc * pp; dc += cc * cc; dp += pp * pp; }
  return n / (Math.sqrt(dc) * Math.sqrt(dp) + 1e-9);
}

function detectKey(buf: AudioBuffer): { note: string; mode: string } {
  const sr = buf.sampleRate, d = buf.getChannelData(0), fsz = 2048;
  const ch = new Array(12).fill(0), step = Math.max(1, Math.floor(d.length / 8));
  for (let s = 0; s < 8; s++) {
    const st = s * step;
    if (st + fsz > d.length) break;
    const win = new Float32Array(fsz);
    for (let i = 0; i < fsz; i++) win[i] = d[st + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (fsz - 1)));
    for (let bin = 2; bin < fsz / 2; bin++) {
      const freq = (bin * sr) / fsz;
      if (freq < 60 || freq > 3000) continue;
      let re = 0, im = 0;
      for (let i = 0; i < fsz; i += 4) { const a = (2 * Math.PI * bin * i) / fsz; re += win[i] * Math.cos(a); im -= win[i] * Math.sin(a); }
      const mag = Math.sqrt(re * re + im * im);
      const midi = Math.round(12 * Math.log2(freq / 440) + 69);
      if (midi >= 0) ch[((midi % 12) + 12) % 12] += mag;
    }
  }
  let best = -Infinity, bn = 0, bm: "major" | "minor" = "major";
  for (let sh = 0; sh < 12; sh++) {
    const rot = [...ch.slice(sh), ...ch.slice(0, sh)];
    const maj = corrProfile(rot, MAJ_P), min = corrProfile(rot, MIN_P);
    if (maj > best) { best = maj; bn = sh; bm = "major"; }
    if (min > best) { best = min; bn = sh; bm = "minor"; }
  }
  return { note: NOTE_NAMES[bn], mode: bm };
}

function detectBPM(buf: AudioBuffer): number {
  const sr = buf.sampleRate, d = buf.getChannelData(0);
  const fSz = 512, hop = 256, frames: number[] = [];
  const maxF = Math.min(Math.floor((d.length - fSz) / hop), 3000);
  for (let i = 0; i < maxF; i++) { let e = 0; for (let j = 0; j < fSz; j++) e += d[i * hop + j] ** 2; frames.push(e / fSz); }
  const maxE = Math.max(...frames) + 1e-9, n = frames.map(e => e / maxE);
  const minL = Math.round(60 * sr / (180 * hop)), maxL = Math.round(60 * sr / (40 * hop));
  let bc = -Infinity, bl = minL;
  for (let lag = minL; lag <= maxL && lag < frames.length / 2; lag++) {
    let c = 0; const len = frames.length - lag;
    for (let i = 0; i < len; i++) c += n[i] * n[i + lag];
    c /= len; if (c > bc) { bc = c; bl = lag; }
  }
  let bpm = (60 * sr) / (bl * hop);
  while (bpm > 175) bpm /= 2; while (bpm < 80) bpm *= 2;
  return Math.round(bpm);
}

function detectPitch(buf: AudioBuffer): string {
  const sr = buf.sampleRate, d = buf.getChannelData(0), wsz = 2048;
  const st = Math.floor(d.length * 0.25);
  const minP = Math.floor(sr / 1800), maxP = Math.min(Math.floor(sr / 80), wsz / 2);
  let bc = 0, bp = -1;
  for (let p = minP; p <= maxP; p++) {
    let c = 0; const len = Math.min(wsz - p, 1024);
    for (let i = 0; i < len; i++) c += (d[st + i] || 0) * (d[st + i + p] || 0);
    c /= len; if (c > bc) { bc = c; bp = p; }
  }
  if (bp < 0 || bc < 0.005) return "—";
  const freq = sr / bp;
  if (freq < 20 || freq > 20000) return "—";
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  const oct = Math.max(0, Math.min(9, Math.floor(midi / 12) - 1));
  return NOTE_NAMES[((midi % 12) + 12) % 12] + oct;
}

function calcDanceability(bpm: number, lufs: number): number {
  const bScore = Math.max(0, 100 - Math.abs(bpm - 125) * 1.2);
  const eScore = Math.min(100, Math.max(0, ((lufs + 40) / 40) * 100));
  return Math.round(bScore * 0.45 + eScore * 0.55);
}

async function analyzeBuffer(buf: AudioBuffer): Promise<Analysis> {
  const stats = computeStats(buf);
  const bpm = detectBPM(buf);
  const { note: keyNote, mode: keyMode } = detectKey(buf);
  const pitch = detectPitch(buf);
  const danceability = calcDanceability(bpm, stats.lufs);
  return { bpm, keyNote, keyMode, pitch, danceability, ...stats };
}

// ─── Canvas utilities ─────────────────────────────────────────────────────────

function drawWaveform(canvas: HTMLCanvasElement, buf: AudioBuffer, color: string, progress: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  const d = buf.getChannelData(0), step = Math.ceil(d.length / w);
  const mid = h / 2, amp = mid * 0.88, px = Math.floor(w * progress);
  for (let i = 0; i < w; i++) {
    let mn = 1, mx = -1;
    for (let j = 0; j < step; j++) { const s = d[i * step + j] ?? 0; if (s < mn) mn = s; if (s > mx) mx = s; }
    ctx.fillStyle = i < px ? color : color + "40";
    ctx.fillRect(i, mid - mx * amp, 1, Math.max(1, (mx - mn) * amp));
  }
}

function drawStereoFan(canvas: HTMLCanvasElement, w: StereoWidth) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const { width: cw, height: ch } = canvas;
  ctx.clearRect(0, 0, cw, ch);
  const cx = cw / 2, cy = ch + 12, r = Math.min(cw, ch) * 1.12;
  const spread = { narrow: 22, standard: 55, wide: 85 }[w];
  const toRad = (d: number) => (d * Math.PI) / 180;

  // Arcs
  for (const [f, a] of [[0.78, 0.18], [0.52, 0.1]] as [number, number][]) {
    ctx.strokeStyle = `rgba(99,179,154,${a})`; ctx.lineWidth = 1; ctx.beginPath();
    ctx.arc(cx, cy, r * f, toRad(-90 - spread), toRad(-90 + spread)); ctx.stroke();
  }

  // Rays
  const rays = 11;
  for (let i = 0; i < rays; i++) {
    const t = i / (rays - 1), ang = toRad(-90 - spread + t * spread * 2), center = i === Math.floor(rays / 2);
    ctx.strokeStyle = `rgba(99,179,154,${center ? 0.9 : 0.15 + (1 - Math.abs(t - 0.5) * 2) * 0.3})`;
    ctx.lineWidth = center ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); ctx.stroke();
  }

  ctx.fillStyle = "#63B39A"; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(99,179,154,0.75)"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
  ctx.fillText({ narrow: "22°", standard: "55°", wide: "85°" }[w], cx, 14);
}

function drawSpectrum(canvas: HTMLCanvasElement, lvl: NoiseLevel) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  const bins = 30, flrRatio = { low: 0.12, medium: 0.28, high: 0.48 }[lvl];
  const bw = Math.max(1, w / bins - 2), flrH = flrRatio * h * 0.82;
  const shape = Array.from({ length: bins }, (_, i) => {
    const x = i / bins;
    const d1 = x - 0.25, d2 = x - 0.55, d3 = x - 0.8;
    return Math.exp(-(d1 * d1) / 0.06) * 0.9 + Math.exp(-(d2 * d2) / 0.05) * 0.65
         + Math.exp(-(d3 * d3) / 0.04) * 0.3 + 0.12;
  });
  const maxS = Math.max(...shape);

  ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(239,68,68,0.42)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h - flrH); ctx.lineTo(w, h - flrH); ctx.stroke(); ctx.setLineDash([]);

  shape.forEach((v, i) => {
    const x = i * (w / bins), barH = Math.max(2, (v / maxS) * h * 0.82), y = h - barH, above = barH > flrH;
    const g = ctx.createLinearGradient(0, y, 0, h);
    g.addColorStop(0, above ? "rgba(99,179,154,0.85)" : "rgba(99,179,154,0.18)");
    g.addColorStop(1, above ? "rgba(99,179,154,0.25)" : "rgba(99,179,154,0.04)");
    ctx.fillStyle = g; ctx.fillRect(x, y, bw, barH);
    if (above) { ctx.fillStyle = "#63B39A"; ctx.beginPath(); ctx.arc(x + bw / 2, y, 1.5, 0, Math.PI * 2); ctx.fill(); }
  });
}

// ─── Master audio processing ──────────────────────────────────────────────────

async function masterAudio(
  buf: AudioBuffer,
  settings: { targetLUFS: number; stereoFactor: number; noiseCutoff: number; highShelf: boolean; limiter: boolean },
  statsIn: BufferStats,
  onStage: (s: Stage) => void
): Promise<{ blob: Blob; masteredBuffer: AudioBuffer; statsOut: BufferStats }> {
  onStage("analyzing");
  const gainLinear = Math.pow(10, (settings.targetLUFS - statsIn.lufs) / 20);

  onStage("eq");
  const off = new OfflineAudioContext(buf.numberOfChannels, buf.length, buf.sampleRate);
  const src = off.createBufferSource(); src.buffer = buf;
  let last: AudioNode = src;

  if (settings.noiseCutoff > 0) {
    const hp = off.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = settings.noiseCutoff; hp.Q.value = 0.6;
    last.connect(hp); last = hp;
  }
  if (settings.highShelf) {
    const hs = off.createBiquadFilter(); hs.type = "highshelf"; hs.frequency.value = 12000; hs.gain.value = 1.5;
    last.connect(hs); last = hs;
  }
  const gn = off.createGain(); gn.gain.value = gainLinear; last.connect(gn); gn.connect(off.destination); src.start();

  onStage("limiting");
  const proc = await off.startRendering();
  const LIMIT = settings.limiter ? Math.pow(10, -0.3 / 20) : 1;
  let peak = 0;
  for (let c = 0; c < proc.numberOfChannels; c++) {
    const d = proc.getChannelData(c); for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]);
  }
  const ps = peak > LIMIT ? LIMIT / peak : 1;

  onStage("encoding");
  const nc = proc.numberOfChannels, ns = proc.length;
  const dBytes = ns * nc * 2, wb = new ArrayBuffer(44 + dBytes), v = new DataView(wb);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); v.setUint32(4, 36 + dBytes, true); ws(8, "WAVE"); ws(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
  v.setUint32(24, proc.sampleRate, true); v.setUint32(28, proc.sampleRate * nc * 2, true);
  v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true); ws(36, "data"); v.setUint32(40, dBytes, true);

  let o = 44; const sf = settings.stereoFactor;
  for (let i = 0; i < ns; i++) {
    if (nc === 1) {
      const s = Math.max(-1, Math.min(1, proc.getChannelData(0)[i] * ps));
      v.setInt16(o, s < 0 ? s * 32768 : s * 32767, true); o += 2;
    } else {
      const L = proc.getChannelData(0)[i], R = proc.getChannelData(1)[i];
      const mid = (L + R) / 2, side = ((L - R) / 2) * sf;
      const Lw = Math.max(-1, Math.min(1, (mid + side) * ps)), Rw = Math.max(-1, Math.min(1, (mid - side) * ps));
      v.setInt16(o, Lw < 0 ? Lw * 32768 : Lw * 32767, true); o += 2;
      v.setInt16(o, Rw < 0 ? Rw * 32768 : Rw * 32767, true); o += 2;
    }
  }
  const blob = new Blob([wb], { type: "audio/wav" });
  return { blob, masteredBuffer: proc, statsOut: computeStats(proc) };
}

// ─── Icon components ──────────────────────────────────────────────────────────

const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>;
const SkipBackIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M19 20 9 12 19 4z"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;
const SkipFwdIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 4l10 8-10 8z"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const DownloadIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const EqIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="9" width="3.5" height="12" rx="1.75" opacity="0.45"/><rect x="7.5" y="4" width="3.5" height="17" rx="1.75"/><rect x="13" y="7" width="3.5" height="14" rx="1.75" opacity="0.78"/><rect x="18.5" y="2" width="3.5" height="19" rx="1.75" opacity="0.55"/></svg>;

// ─── Toggle switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ label, value, onChange, desc }: { label: string; value: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-grid-500)] last:border-0">
      <div>
        <div className="text-sm font-medium text-[var(--color-foreground)]">{label}</div>
        {desc && <div className="text-xs text-[var(--color-muted-2)] mt-0.5">{desc}</div>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
        style={{ background: value ? "var(--color-deep-teal)" : "var(--color-grid-500)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

// ─── Level selector (Low / Medium / High) ────────────────────────────────────

function LevelSelector<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  const idx = options.indexOf(value);
  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={() => idx > 0 && onChange(options[idx - 1])}
        disabled={idx === 0}
        className="w-7 h-7 rounded-lg border border-[var(--color-grid-500)] text-[var(--color-muted)] text-sm flex items-center justify-center hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >−</button>
      <div className="flex-1 flex gap-1">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="flex-1 py-1 rounded-lg text-xs font-semibold font-mono capitalize transition-all"
            style={o === value
              ? { background: "var(--color-deep-teal)", color: "white" }
              : { background: "var(--color-grid-300)", color: "var(--color-muted)" }
            }
          >{o}</button>
        ))}
      </div>
      <button
        onClick={() => idx < options.length - 1 && onChange(options[idx + 1])}
        disabled={idx === options.length - 1}
        className="w-7 h-7 rounded-lg border border-[var(--color-grid-500)] text-[var(--color-muted)] text-sm flex items-center justify-center hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >+</button>
    </div>
  );
}

// ─── Waveform mini player (used in Before/After) ──────────────────────────────

interface MiniPlayerProps { buffer: AudioBuffer; url: string; label: string; accentColor: string; isActive: boolean; onActivate: () => void; stats: BufferStats; }

function MiniPlayer({ buffer, url, label, accentColor, isActive, onActivate, stats }: MiniPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => { const c = canvasRef.current; if (c) drawWaveform(c, buffer, accentColor, progress); }, [buffer, accentColor, progress]);

  useEffect(() => {
    if (!playing) return;
    const audio = audioRef.current; if (!audio) return;
    const tick = () => {
      if (audio.duration > 0) { setProgress(audio.currentTime / audio.duration); setCurrentTime(audio.currentTime); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  useEffect(() => {
    if (!isActive && playing) { audioRef.current?.pause(); setPlaying(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const togglePlay = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { onActivate(); a.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current; if (!a || !duration) return;
    const r = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth;
    a.currentTime = Math.max(0, Math.min(1, r)) * duration;
    setProgress(Math.max(0, Math.min(1, r)));
  };

  return (
    <div className={`glass-card rounded-2xl p-4 transition-all ${isActive ? "ring-2" : ""}`} style={isActive ? { "--tw-ring-color": accentColor } as React.CSSProperties : {}}>
      <audio ref={audioRef} src={url} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }} />
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: accentColor }}>{label}</span>
        <span className="font-mono text-xs text-[var(--color-muted-2)]">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
      </div>
      <div className="relative rounded-xl overflow-hidden cursor-pointer mb-2" style={{ background: "var(--color-grid-300)" }} onClick={seek}>
        <canvas ref={canvasRef} width={600} height={56} className="w-full block" style={{ height: "48px" }} />
        <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${progress * 100}%`, background: accentColor }} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={togglePlay} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-85" style={{ background: accentColor, color: "white" }}>
          {playing ? <PauseIcon /> : <PlayIcon />} {playing ? "Pause" : "Play"}
        </button>
        <div className="flex gap-2 ml-auto text-right">
          <div><div className="text-xs text-[var(--color-muted-2)]">LUFS</div><div className="font-mono text-sm font-bold text-[var(--color-foreground)]">{stats.lufs.toFixed(1)}</div></div>
          <div><div className="text-xs text-[var(--color-muted-2)]">Peak</div><div className="font-mono text-sm font-bold text-[var(--color-foreground)]">{stats.peak.toFixed(1)}</div></div>
          <div><div className="text-xs text-[var(--color-muted-2)]">DR</div><div className="font-mono text-sm font-bold text-[var(--color-foreground)]">{stats.dr.toFixed(1)}</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── Metadata modal ───────────────────────────────────────────────────────────

function MetadataModal({ metadata, setMetadata, onClose }: { metadata: Metadata; setMetadata: (m: Metadata) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(metadata);
  const field = (key: keyof Metadata, label: string, placeholder: string) => (
    <div>
      <label className="block text-xs font-mono text-[var(--color-muted-2)] mb-1.5 tracking-wider uppercase">{label}</label>
      <input
        value={draft[key]}
        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-grid-300)] border border-[var(--color-grid-500)] text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-2)] focus:border-[var(--color-highlight)] focus:outline-none transition-colors"
      />
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md" style={{ zIndex: 51 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--color-foreground)]">Edit Track Metadata</h3>
          <button onClick={onClose} className="text-[var(--color-muted-2)] hover:text-[var(--color-foreground)] text-lg leading-none">✕</button>
        </div>
        <div className="space-y-4">
          {field("title", "Title", "Track name")}
          {field("artist", "Artist", "Artist name")}
          {field("album", "Album", "Album or EP name")}
          {field("year", "Year", new Date().getFullYear().toString())}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--color-grid-500)] text-sm text-[var(--color-muted)] hover:border-[var(--color-highlight)] transition-all">Cancel</button>
          <button onClick={() => { setMetadata(draft); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-[var(--color-deep-teal)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">Save Metadata</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MasteringClient() {
  // File + audio
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mastering settings
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [stereoWidth, setStereoWidth] = useState<StereoWidth>("standard");
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>("low");
  const [autoEQ, setAutoEQ] = useState(true);
  const [lowCut, setLowCut] = useState(true);
  const [highShelf, setHighShelf] = useState(true);
  const [limiter, setLimiter] = useState(true);
  const [platform, setPlatform] = useState<Platform>("spotify");

  // Processing
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MasteringResult | null>(null);

  // Playback state for WaveformPlayer
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainAudioRef = useRef<HTMLAudioElement>(null);
  const mainRafRef = useRef<number>(0);
  const [mainPlaying, setMainPlaying] = useState(false);
  const [mainProgress, setMainProgress] = useState(0);
  const [mainTime, setMainTime] = useState(0);
  const [mainDuration, setMainDuration] = useState(0);

  // Before/After
  const [activePlayer, setActivePlayer] = useState<"original" | "mastered">("mastered");

  // Metadata + download
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({ title: "", artist: "", album: "", year: "" });

  // Settings cards canvases
  const stereoCanvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniWaveRef = useRef<HTMLCanvasElement>(null);

  // Derived
  const targetLUFS = PLATFORM_LUFS[platform] + INTENSITY_OFFSET[intensity];
  const isProcessing = stage !== "idle" && stage !== "done" && stage !== "error";

  // ── File handling ────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.match(/audio\/(mpeg|wav|mp3|x-wav)/)) { setError("Please upload an MP3 or WAV file."); return; }
    setFile(f); setError(null); setResult(null); setStage("idle");
    setMainProgress(0); setMainTime(0); setMainDuration(0); setMainPlaying(false);
    setOriginalUrl(URL.createObjectURL(f));
    setLoadingAudio(true);
    try {
      const ab = await f.arrayBuffer();
      const ctx = new AudioContext();
      const buf = await ctx.decodeAudioData(ab);
      await ctx.close();
      setAudioBuffer(buf);
      // Prefill metadata from filename
      const title = f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setMetadata(m => ({ ...m, title }));
      const result = await analyzeBuffer(buf);
      setAnalysis(result);
    } catch (e) {
      console.error(e); setError("Could not decode audio. Please try a different file.");
    } finally {
      setLoadingAudio(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  // ── Canvas effects ────────────────────────────────────────────────────────────

  useEffect(() => {
    const c = mainCanvasRef.current; if (c && audioBuffer) drawWaveform(c, audioBuffer, "#63B39A", mainProgress);
  }, [audioBuffer, mainProgress]);

  useEffect(() => {
    const c = stereoCanvasRef.current; if (c) drawStereoFan(c, stereoWidth);
  }, [stereoWidth]);

  useEffect(() => {
    const c = noiseCanvasRef.current; if (c) drawSpectrum(c, noiseLevel);
  }, [noiseLevel]);

  useEffect(() => {
    const c = miniWaveRef.current; if (c && audioBuffer) drawWaveform(c, audioBuffer, "#63B39A", 0);
  }, [audioBuffer, intensity]);

  // ── Main player ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mainPlaying) return;
    const audio = mainAudioRef.current; if (!audio) return;
    const tick = () => {
      if (audio.duration > 0) { setMainProgress(audio.currentTime / audio.duration); setMainTime(audio.currentTime); }
      mainRafRef.current = requestAnimationFrame(tick);
    };
    mainRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(mainRafRef.current);
  }, [mainPlaying]);

  const toggleMain = () => {
    const a = mainAudioRef.current; if (!a) return;
    if (mainPlaying) { a.pause(); setMainPlaying(false); } else { a.play(); setMainPlaying(true); }
  };

  const skipMain = (delta: number) => {
    const a = mainAudioRef.current; if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  };

  const seekMain = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = mainAudioRef.current; if (!a || !mainDuration) return;
    const r = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth;
    a.currentTime = Math.max(0, Math.min(1, r)) * mainDuration;
    setMainProgress(Math.max(0, Math.min(1, r)));
  };

  // ── Mastering ────────────────────────────────────────────────────────────────

  const runMastering = async () => {
    if (!audioBuffer || !analysis) return;
    setError(null); setResult(null);
    const noiseCutoff = lowCut ? Math.max(NOISE_CUTOFF[noiseLevel], 30) : NOISE_CUTOFF[noiseLevel];
    try {
      const { blob, masteredBuffer, statsOut } = await masterAudio(
        audioBuffer,
        { targetLUFS, stereoFactor: STEREO_FACTOR[stereoWidth], noiseCutoff, highShelf: highShelf && autoEQ, limiter },
        { lufs: analysis.lufs, peak: analysis.peak, dr: analysis.dr },
        setStage
      );
      setResult({ blob, masteredUrl: URL.createObjectURL(blob), masteredBuffer, statsOut });
      setStage("done"); setActivePlayer("mastered");
    } catch (e) {
      console.error(e); setError("Mastering failed. Please try a different file."); setStage("error");
    }
  };

  const download = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.masteredUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + "_mastered.wav";
    a.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {showMetadata && <MetadataModal metadata={metadata} setMetadata={setMetadata} onClose={() => setShowMetadata(false)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="tool-icon"><EqIcon /></div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Mastering Tool</h1>
          <p className="text-xs text-[var(--color-muted-2)]">OfflineAudioContext · BiquadFilter · DynamicsCompressor · 100% local</p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium flex-shrink-0">Demo — Free</span>
      </div>
      <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-8">
        Upload an MP3 or WAV — we analyze BPM, key, and loudness, then master to your target platform standard. All processing is local; your audio never leaves your device.
      </p>

      {/* Upload zone */}
      {!audioBuffer && !loadingAudio && (
        <div
          className={`upload-zone rounded-2xl p-10 flex flex-col items-center text-center cursor-pointer mb-6 ${dragOver ? "drag-over" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="audio/mpeg,audio/wav,.mp3,.wav" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="tool-icon mb-4" style={{ color: "var(--color-deep-teal)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <p className="font-semibold text-[var(--color-foreground)] mb-1">Drop your MP3 or WAV here</p>
          <p className="text-sm text-[var(--color-muted-2)]">or click to browse</p>
        </div>
      )}

      {/* Loading/analyzing */}
      {loadingAudio && (
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 mb-6">
          <div className="w-10 h-10 border-2 border-[var(--color-highlight)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-muted)]">Analyzing track — detecting BPM, key, and loudness…</p>
        </div>
      )}

      {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Main Waveform Player */}
      {audioBuffer && analysis && !loadingAudio && originalUrl && (
        <>
          <div className="glass-card rounded-2xl p-5 mb-5">
            <audio ref={mainAudioRef} src={originalUrl}
              onLoadedMetadata={e => setMainDuration(e.currentTarget.duration)}
              onEnded={() => { setMainPlaying(false); setMainProgress(0); setMainTime(0); }}
            />
            {/* Waveform canvas */}
            <div className="relative rounded-xl overflow-hidden cursor-pointer mb-3"
              style={{ background: "var(--color-grid-300)" }} onClick={seekMain}>
              <canvas ref={mainCanvasRef} width={1200} height={110} className="w-full block" style={{ height: "88px" }} />
              <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${mainProgress * 100}%`, background: "#63B39A" }} />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => skipMain(-10)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-grid-500)] text-[var(--color-muted)] hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] transition-all">
                <SkipBackIcon />
              </button>
              <button onClick={toggleMain} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-85" style={{ background: "#2F6B58", color: "white" }}>
                {mainPlaying ? <PauseIcon /> : <PlayIcon />}
                {mainPlaying ? "Pause" : "Play"}
              </button>
              <button onClick={() => skipMain(10)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-grid-500)] text-[var(--color-muted)] hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] transition-all">
                <SkipFwdIcon />
              </button>
              <span className="font-mono text-sm text-[var(--color-muted-2)] ml-1">{fmtTime(mainTime)} / {fmtTime(mainDuration)}</span>
              <span className="ml-auto text-xs text-[var(--color-muted-2)] truncate max-w-[160px]">{file?.name}</span>
            </div>

            {/* Info bar */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[var(--color-grid-500)]">
              {[
                ["Song Pitch", analysis.pitch],
                ["BPM", String(analysis.bpm)],
                ["Chord Key", `${analysis.keyNote} ${analysis.keyMode}`],
                ["Danceability", `${analysis.danceability}%`],
              ].map(([label, value]) => (
                <div key={label} className="text-center">
                  <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-1">{label}</div>
                  <div className="font-mono font-bold text-[var(--color-foreground)] text-base leading-tight">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings cards */}
          <div className="grid grid-cols-3 gap-4 mb-5">

            {/* Card 1: Mastering Intensity */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-2">Mastering Intensity</div>
              <div className="font-mono text-xl font-bold text-[var(--color-foreground)] mb-0.5">
                {targetLUFS.toFixed(1)} <span className="text-xs font-normal text-[var(--color-muted-2)]">dB LUFSi</span>
              </div>
              <div className="text-xs text-[var(--color-muted-2)] mb-2">{platform === "apple" ? "Apple Music" : platform === "youtube" ? "YouTube" : "Spotify"} target</div>
              <canvas ref={miniWaveRef} width={400} height={50} className="w-full rounded-lg mb-2" style={{ height: "40px", background: "var(--color-grid-300)" }} />
              <LevelSelector<Intensity> value={intensity} onChange={setIntensity} options={["low", "medium", "high"]} />
            </div>

            {/* Card 2: Stereo Widening */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-2">Stereo Widening</div>
              <canvas ref={stereoCanvasRef} width={200} height={100} className="w-full mb-2" style={{ height: "90px" }} />
              <div className="text-xs text-center text-[var(--color-muted-2)] mb-2">
                {{ narrow: "Focused mono", standard: "Natural stereo", wide: "Wide stereo" }[stereoWidth]}
              </div>
              <LevelSelector<StereoWidth> value={stereoWidth} onChange={setStereoWidth} options={["narrow", "standard", "wide"]} />
            </div>

            {/* Card 3: Noise Reduction */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-2">Noise Reduction</div>
              <canvas ref={noiseCanvasRef} width={300} height={90} className="w-full rounded-lg mb-2" style={{ height: "82px", background: "var(--color-grid-300)" }} />
              <div className="text-xs text-center text-[var(--color-muted-2)] mb-2">
                HP cut: {NOISE_CUTOFF[noiseLevel]}Hz · <span className="text-red-400">— noise floor</span>
              </div>
              <LevelSelector<NoiseLevel> value={noiseLevel} onChange={setNoiseLevel} options={["low", "medium", "high"]} />
            </div>
          </div>

          {/* Processing toggles + platform */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-2">Processing</div>
            <ToggleSwitch label="Automatic Equalization" value={autoEQ} onChange={setAutoEQ} desc="Analyse spectrum and apply corrective EQ" />
            <ToggleSwitch label="Low-cut Filter (30 Hz)" value={lowCut} onChange={setLowCut} desc="Remove sub-bass rumble below 30 Hz" />
            <ToggleSwitch label="High-shelf Boost (12 kHz)" value={highShelf} onChange={setHighShelf} desc="+1.5 dB air boost above 12 kHz" />
            <ToggleSwitch label="Limiter −0.3 dBTP" value={limiter} onChange={setLimiter} desc="True-peak brick-wall limiter" />

            <div className="mt-4 pt-4 border-t border-[var(--color-grid-500)]">
              <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-2">Target Platform</div>
              <div className="flex gap-2">
                {(["spotify", "apple", "youtube"] as Platform[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-mono transition-all"
                    style={p === platform
                      ? { background: "var(--color-deep-teal)", color: "white" }
                      : { background: "var(--color-grid-300)", color: "var(--color-muted)", border: "1px solid var(--color-grid-500)" }
                    }
                  >
                    {p === "spotify" ? "Spotify −14" : p === "apple" ? "Apple −16" : "YouTube −14"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Processing progress */}
          {isProcessing && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--color-muted)]">{STAGE_LABELS[stage]}</span>
                <span className="font-mono text-xs text-[var(--color-muted-2)]">{STAGE_PROGRESS[stage]}%</span>
              </div>
              <div className="h-2 bg-[var(--color-grid-300)] rounded-full overflow-hidden">
                <div className="h-full progress-bar-fill rounded-full" style={{ width: `${STAGE_PROGRESS[stage]}%` }} />
              </div>
            </div>
          )}

          {/* Master button */}
          {stage !== "done" && !isProcessing && (
            <button onClick={runMastering} className="w-full py-3.5 rounded-xl bg-[var(--color-deep-teal)] text-white font-semibold text-sm hover:opacity-90 transition-opacity mb-8">
              Master this track
            </button>
          )}

          {/* ── Before / After ── */}
          {result && stage === "done" && (
            <>
              <div className="flex items-center justify-between mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)] pulse-ring" />
                  <span className="font-semibold text-[var(--color-foreground)]">Master ready</span>
                </div>
                <div className="ab-toggle">
                  <button className={activePlayer === "original" ? "active" : ""} onClick={() => setActivePlayer("original")}>A</button>
                  <button className={activePlayer === "mastered" ? "active" : ""} onClick={() => setActivePlayer("mastered")}>B</button>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                <MiniPlayer buffer={audioBuffer} url={originalUrl} label="A — Original" accentColor="#8b93a8"
                  isActive={activePlayer === "original"} onActivate={() => setActivePlayer("original")}
                  stats={{ lufs: analysis.lufs, peak: analysis.peak, dr: analysis.dr }} />
                <MiniPlayer buffer={result.masteredBuffer} url={result.masteredUrl} label="B — Mastered"
                  accentColor="#2F6B58" isActive={activePlayer === "mastered"} onActivate={() => setActivePlayer("mastered")}
                  stats={result.statsOut} />
              </div>

              {/* Stats comparison */}
              <div className="stats-table mb-6">
                <div className="stats-table-head">
                  <span>Metric</span><span>Original</span><span style={{ color: "var(--color-deep-teal)" }}>Mastered</span>
                </div>
                {([
                  ["Integrated LUFS", " LUFS", analysis.lufs, result.statsOut.lufs, false],
                  ["True Peak", " dBFS", analysis.peak, result.statsOut.peak, true],
                  ["Dynamic Range", " dB", analysis.dr, result.statsOut.dr, false],
                ] as [string, string, number, number, boolean][]).map(([label, unit, vIn, vOut, lowerBetter]) => (
                  <div key={label} className="stats-table-row">
                    <span className="text-xs text-[var(--color-muted)]">{label}</span>
                    <span className="stats-val text-[var(--color-muted)]">{vIn.toFixed(1)}{unit}</span>
                    <span className={`stats-val ${(lowerBetter ? vOut < vIn : vOut > vIn) ? "improved" : "text-[var(--color-foreground)]"}`}>{vOut.toFixed(1)}{unit}</span>
                  </div>
                ))}
              </div>

              {/* Download section */}
              <div className="glass-card rounded-2xl p-5">
                <div className="text-xs font-mono text-[var(--color-muted-2)] uppercase tracking-wider mb-3">Download</div>

                {/* Filename preview */}
                <div className="flex items-center gap-3 bg-[var(--color-grid-300)] rounded-xl px-4 py-3 mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[var(--color-highlight)] flex-shrink-0" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-medium text-[var(--color-foreground)] truncate">
                      {file?.name.replace(/\.[^.]+$/, "") ?? "track"}_mastered.wav
                    </div>
                    {(metadata.artist || metadata.title) && (
                      <div className="text-xs text-[var(--color-muted-2)] truncate mt-0.5">
                        {[metadata.artist, metadata.title, metadata.year].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto text-xs text-[var(--color-muted-2)] flex-shrink-0">WAV · 16-bit</div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowMetadata(true)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-grid-500)] text-sm text-[var(--color-muted)] hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] transition-all">
                    Edit Metadata
                  </button>
                  <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-deep-teal)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                    <DownloadIcon /> Download WAV
                  </button>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => { setFile(null); setAudioBuffer(null); setAnalysis(null); setOriginalUrl(null); setResult(null); setStage("idle"); setError(null); }}
                className="w-full mt-3 py-2.5 rounded-xl border border-[var(--color-grid-500)] text-[var(--color-muted)] text-sm hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] transition-all"
              >
                Master another track
              </button>
            </>
          )}

          {/* Info pills (when not done) */}
          {stage !== "done" && (
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-[var(--color-muted-2)]">
              {[["−14 LUFS", "Spotify standard"], ["−0.3 dBTP", "True-peak limit"], ["100% local", "No upload"]].map(([v, l]) => (
                <div key={v} className="glass-card rounded-xl p-3">
                  <div className="font-mono font-bold text-[var(--color-foreground)] mb-0.5">{v}</div>
                  <div>{l}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
