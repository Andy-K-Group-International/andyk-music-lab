"use client";

import { useState, useRef, useCallback } from "react";

// Chromatic profile for Krumhansl-Schmuckler key detection
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function correlate(chroma: number[], profile: number[]): number {
  const n = 12;
  const meanC = chroma.reduce((a, b) => a + b, 0) / n;
  const meanP = profile.reduce((a, b) => a + b, 0) / n;
  let num = 0, dc = 0, dp = 0;
  for (let i = 0; i < n; i++) {
    const cc = chroma[i] - meanC;
    const pp = profile[i] - meanP;
    num += cc * pp;
    dc += cc * cc;
    dp += pp * pp;
  }
  return num / (Math.sqrt(dc) * Math.sqrt(dp) + 1e-9);
}

function detectKey(chroma: number[]): { note: string; mode: "major" | "minor" } {
  let bestCorr = -Infinity;
  let bestNote = 0;
  let bestMode: "major" | "minor" = "major";

  for (let shift = 0; shift < 12; shift++) {
    const rotated = [...chroma.slice(shift), ...chroma.slice(0, shift)];
    const maj = correlate(rotated, MAJOR_PROFILE);
    const min = correlate(rotated, MINOR_PROFILE);
    if (maj > bestCorr) { bestCorr = maj; bestNote = shift; bestMode = "major"; }
    if (min > bestCorr) { bestCorr = min; bestNote = shift; bestMode = "minor"; }
  }

  return { note: NOTE_NAMES[bestNote], mode: bestMode };
}

function buildChroma(buffer: AudioBuffer): number[] {
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const fftSize = 4096;
  const chroma = new Array(12).fill(0);

  // Sample windows across the track
  const step = Math.floor(data.length / 20);
  for (let start = 0; start + fftSize < data.length; start += step) {
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      // Hann window
      window[i] = data[start + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    }
    // Simple DFT for pitch classes
    for (let bin = 1; bin < fftSize / 2; bin++) {
      const freq = (bin * sampleRate) / fftSize;
      if (freq < 55 || freq > 4000) continue;
      // Compute magnitude for this bin
      let re = 0, im = 0;
      for (let i = 0; i < fftSize; i++) {
        const angle = (2 * Math.PI * bin * i) / fftSize;
        re += window[i] * Math.cos(angle);
        im -= window[i] * Math.sin(angle);
      }
      const mag = Math.sqrt(re * re + im * im);
      // Map frequency to pitch class
      const midi = Math.round(12 * Math.log2(freq / 440) + 69);
      if (midi >= 0) chroma[((midi % 12) + 12) % 12] += mag;
    }
  }

  return chroma;
}

async function detectBPM(buffer: AudioBuffer): Promise<number> {
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);

  // Onset detection via energy difference
  const frameSize = 512;
  const hopSize = 256;
  const frames: number[] = [];

  for (let i = 0; i + frameSize < data.length; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < frameSize; j++) energy += data[i + j] ** 2;
    frames.push(energy / frameSize);
  }

  // Normalize
  const maxE = Math.max(...frames);
  const normalized = frames.map((e) => e / (maxE + 1e-9));

  // Autocorrelation of onset signal to find tempo
  const minLag = Math.round(sampleRate / (hopSize * 3)); // 180 BPM
  const maxLag = Math.round(sampleRate / (hopSize * 0.5)); // 30 BPM (practical max 200)

  const minBpmLag = Math.round((60 * sampleRate) / (180 * hopSize));
  const maxBpmLag = Math.round((60 * sampleRate) / (40 * hopSize));

  let bestCorr = -Infinity;
  let bestLag = minLag;

  for (let lag = minBpmLag; lag <= maxBpmLag && lag < frames.length / 2; lag++) {
    let corr = 0;
    const n = frames.length - lag;
    for (let i = 0; i < n; i++) {
      corr += normalized[i] * normalized[i + lag];
    }
    corr /= n;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  const bpm = (60 * sampleRate) / (bestLag * hopSize);

  // Fold into 80–175 BPM range
  let b = bpm;
  while (b > 175) b /= 2;
  while (b < 80) b *= 2;

  return Math.round(b);
}

function computeEnergy(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] ** 2;
  const rms = Math.sqrt(sum / data.length);
  const db = 20 * Math.log10(rms + 1e-9);
  // Map typical range -40..0 dBFS → 0..100
  return Math.round(Math.max(0, Math.min(100, ((db + 40) / 40) * 100)));
}

// Camelot Wheel mapping
const CAMELOT: Record<string, string> = {
  "C major": "8B", "G major": "9B", "D major": "10B", "A major": "11B",
  "E major": "12B", "B major": "1B", "F# major": "2B", "C# major": "3B",
  "G# major": "4B", "D# major": "5B", "A# major": "6B", "F major": "7B",
  "A minor": "8A", "E minor": "9A", "B minor": "10A", "F# minor": "11A",
  "C# minor": "12A", "G# minor": "1A", "D# minor": "2A", "A# minor": "3A",
  "F minor": "4A", "C minor": "5A", "G minor": "6A", "D minor": "7A",
};

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BpmClient() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bpm: number;
    key: string;
    mode: string;
    camelot: string;
    energy: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.match(/audio\/(mpeg|wav|mp3|x-wav)/)) {
      setError("Please upload an MP3 or WAV file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const ab = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const buffer = await audioCtx.decodeAudioData(ab);
      await audioCtx.close();

      const [bpm, chroma, energy] = await Promise.all([
        detectBPM(buffer),
        Promise.resolve(buildChroma(buffer)),
        Promise.resolve(computeEnergy(buffer)),
      ]);

      const { note, mode } = detectKey(chroma);
      const keyLabel = `${note} ${mode}`;
      const camelot = CAMELOT[keyLabel] ?? "—";

      setResult({ bpm, key: note, mode, camelot, energy });
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try a different file.");
    } finally {
      setAnalyzing(false);
    }
  };

  const energyLabel = (e: number) => {
    if (e >= 70) return "High";
    if (e >= 40) return "Medium";
    return "Low";
  };

  const energyColor = (e: number) => {
    if (e >= 70) return "text-red-500";
    if (e >= 40) return "text-[var(--color-highlight)]";
    return "text-blue-400";
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🥁</span>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">BPM + Key Detector</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium">
            Free
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Upload an MP3 or WAV. We&apos;ll detect the BPM, musical key, and energy level entirely
          in your browser — no uploads, no server.
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer mb-6 ${
          dragOver ? "drag-over" : ""
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/wav,.mp3,.wav"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[var(--color-foreground)] truncate max-w-xs">
                {file.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(null); }}
                className="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-foreground)] ml-4"
              >
                ✕ Remove
              </button>
            </div>
            <div className="text-xs text-[var(--color-muted-2)]">{formatBytes(file.size)}</div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--color-soft-green)] flex items-center justify-center mb-4 text-2xl">
              🎵
            </div>
            <p className="font-medium text-[var(--color-foreground)] mb-1">Drop your MP3 or WAV here</p>
            <p className="text-sm text-[var(--color-muted-2)]">or click to browse</p>
          </>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-[var(--color-muted-2)] mb-1 uppercase tracking-wider">BPM</div>
              <div className="text-4xl font-bold font-mono text-[var(--color-foreground)]">
                {result.bpm}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-muted-2)] mb-1 uppercase tracking-wider">Key</div>
              <div className="text-3xl font-bold font-mono text-[var(--color-foreground)]">
                {result.key}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5 capitalize">{result.mode}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-muted-2)] mb-1 uppercase tracking-wider">Energy</div>
              <div className={`text-3xl font-bold font-mono ${energyColor(result.energy)}`}>
                {result.energy}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">{energyLabel(result.energy)}</div>
            </div>
          </div>
          <div className="tron-line my-5" />
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-[var(--color-muted-2)]">Camelot key:&nbsp;</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded ${
                  result.camelot.endsWith("B") ? "camelot-B" : "camelot-A"
                }`}
              >
                {result.camelot}
              </span>
            </div>
            <div className="text-[var(--color-muted-2)] text-xs">
              {result.key} {result.mode} · {result.bpm} BPM
            </div>
          </div>
        </div>
      )}

      {/* Analyze button */}
      {file && !analyzing && (
        <button
          onClick={analyze}
          className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Analyze track
        </button>
      )}

      {analyzing && (
        <div className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)]/60 text-white font-medium text-sm text-center">
          <span className="animate-pulse">Analyzing…</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-[var(--color-muted-2)]">
        {[
          ["BPM", "Autocorrelation onset detection"],
          ["Key", "Krumhansl-Schmuckler profiles"],
          ["Camelot", "Harmonic mixing wheel"],
        ].map(([val, label]) => (
          <div key={val} className="glass-card rounded-xl p-3">
            <div className="font-mono font-bold text-[var(--color-foreground)] mb-0.5">{val}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
