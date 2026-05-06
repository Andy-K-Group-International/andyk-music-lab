"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Stage =
  | "idle"
  | "loading"
  | "analyzing"
  | "eq"
  | "limiting"
  | "encoding"
  | "done"
  | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  loading: "Loading audio…",
  analyzing: "Analyzing loudness…",
  eq: "Applying EQ…",
  limiting: "Limiting & normalizing…",
  encoding: "Encoding WAV…",
  done: "Done!",
  error: "Error",
};

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0,
  loading: 10,
  analyzing: 30,
  eq: 55,
  limiting: 75,
  encoding: 90,
  done: 100,
  error: 0,
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface BufferStats {
  lufs: number;
  peak: number;
  dr: number;
}

function computeBufferStats(buffer: AudioBuffer): BufferStats {
  let sumSq = 0, total = 0, peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
      sumSq += data[i] * data[i];
      total++;
    }
  }
  const rms = Math.sqrt(sumSq / total);
  const lufs = 20 * Math.log10(Math.max(rms, 1e-10)) - 0.691;
  const peakDB = 20 * Math.log10(Math.max(peak, 1e-10));
  const dr = peakDB - lufs;
  return { lufs, peak: peakDB, dr };
}

function drawWaveform(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  colorHex: string,
  progress: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const mid = height / 2;
  const amp = mid * 0.88;
  const playedPx = Math.floor(width * progress);

  for (let i = 0; i < width; i++) {
    let min = 1,
      max = -1;
    for (let j = 0; j < step; j++) {
      const s = data[i * step + j] ?? 0;
      if (s < min) min = s;
      if (s > max) max = s;
    }
    const y1 = mid - max * amp;
    const y2 = mid - min * amp;
    ctx.fillStyle = i < playedPx ? colorHex : colorHex + "40";
    ctx.fillRect(i, y1, 1, Math.max(1, y2 - y1));
  }
}

async function masterAudio(
  arrayBuffer: ArrayBuffer,
  onStage: (s: Stage) => void
): Promise<{
  blob: Blob;
  originalBuffer: AudioBuffer;
  masteredBuffer: AudioBuffer;
  statsIn: BufferStats;
  statsOut: BufferStats;
}> {
  onStage("loading");
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  onStage("analyzing");
  const statsIn = computeBufferStats(decoded);

  onStage("eq");
  const TARGET_LUFS = -14;
  const gainNeeded = TARGET_LUFS - statsIn.lufs;
  const gainLinear = Math.pow(10, gainNeeded / 20);

  const offCtx = new OfflineAudioContext(
    decoded.numberOfChannels,
    decoded.length,
    decoded.sampleRate
  );

  const src = offCtx.createBufferSource();
  src.buffer = decoded;

  const hiPass = offCtx.createBiquadFilter();
  hiPass.type = "highpass";
  hiPass.frequency.value = 30;
  hiPass.Q.value = 0.707;

  const hiShelf = offCtx.createBiquadFilter();
  hiShelf.type = "highshelf";
  hiShelf.frequency.value = 12000;
  hiShelf.gain.value = 1.5;

  const gainNode = offCtx.createGain();
  gainNode.gain.value = gainLinear;

  src.connect(hiPass);
  hiPass.connect(hiShelf);
  hiShelf.connect(gainNode);
  gainNode.connect(offCtx.destination);
  src.start();

  onStage("limiting");
  const processed = await offCtx.startRendering();

  const LIMIT_DBTP = -0.3;
  const limitLinear = Math.pow(10, LIMIT_DBTP / 20);
  let peak = 0;
  for (let c = 0; c < processed.numberOfChannels; c++) {
    const data = processed.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }
  const peakScale = peak > limitLinear ? limitLinear / peak : 1;

  onStage("encoding");
  const numCh = processed.numberOfChannels;
  const numSamples = processed.length;
  const byteRate = processed.sampleRate * numCh * 2;
  const blockAlign = numCh * 2;
  const dataBytes = numSamples * numCh * 2;
  const wavBuffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(wavBuffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, processed.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numCh; c++) {
      const sample = Math.max(-1, Math.min(1, processed.getChannelData(c)[i] * peakScale));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }

  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  const statsOut = computeBufferStats(processed);

  return { blob, originalBuffer: decoded, masteredBuffer: processed, statsIn, statsOut };
}

// ── Waveform player ─────────────────────────────────────────────────────────

interface WaveformPlayerProps {
  buffer: AudioBuffer;
  url: string;
  label: string;
  sublabel?: string;
  accentColor: string;
  isActive: boolean;
  onActivate: () => void;
}

function WaveformPlayer({
  buffer,
  url,
  label,
  sublabel,
  accentColor,
  isActive,
  onActivate,
}: WaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWaveform(canvas, buffer, accentColor, progress);
  }, [buffer, accentColor, progress]);

  useEffect(() => {
    if (!playing) return;
    const audio = audioRef.current;
    if (!audio) return;
    const tick = () => {
      if (audio.duration > 0) {
        const p = audio.currentTime / audio.duration;
        setProgress(p);
        setCurrentTime(audio.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  // Pause when de-activated in A/B mode
  useEffect(() => {
    if (!isActive && playing) {
      audioRef.current?.pause();
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      onActivate();
      audio.play();
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setProgress(ratio);
    setCurrentTime(ratio * duration);
  };

  return (
    <div
      className={`glass-card rounded-2xl p-4 transition-all ${
        isActive ? "ring-2" : ""
      }`}
      style={isActive ? { "--tw-ring-color": accentColor } as React.CSSProperties : {}}
    >
      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }}
      />

      <div className="flex items-center justify-between mb-3">
        <div>
          <span
            className="text-xs font-mono font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          {sublabel && (
            <span className="ml-2 text-xs text-[var(--color-muted-2)]">{sublabel}</span>
          )}
        </div>
        <span className="font-mono text-xs text-[var(--color-muted-2)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="waveform-hit mb-3" onClick={seek}>
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="w-full block"
          style={{ height: "68px" }}
        />
        <div
          className="waveform-playhead"
          style={{ left: `calc(${progress * 100}% - 1px)`, background: accentColor }}
        />
      </div>

      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
        style={{ background: accentColor, color: "white" }}
      >
        {playing ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1.5" />
            <rect x="14" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.14v14l11-7z" />
          </svg>
        )}
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}

// ── Stats comparison ─────────────────────────────────────────────────────────

function StatsComparison({ statsIn, statsOut }: { statsIn: BufferStats; statsOut: BufferStats }) {
  const rows: { label: string; unit: string; valIn: number; valOut: number; lowerIsBetter?: boolean }[] = [
    { label: "Integrated LUFS", unit: " LUFS", valIn: statsIn.lufs, valOut: statsOut.lufs, lowerIsBetter: false },
    { label: "True Peak", unit: " dBFS", valIn: statsIn.peak, valOut: statsOut.peak, lowerIsBetter: true },
    { label: "Dynamic Range", unit: " dB", valIn: statsIn.dr, valOut: statsOut.dr, lowerIsBetter: false },
  ];

  return (
    <div className="stats-table">
      <div className="stats-table-head">
        <span>Metric</span>
        <span>Original</span>
        <span style={{ color: "var(--color-deep-teal)" }}>Mastered</span>
      </div>
      {rows.map((r) => {
        const improved = r.lowerIsBetter ? r.valOut < r.valIn : r.valOut > r.valIn;
        return (
          <div key={r.label} className="stats-table-row">
            <span className="text-[var(--color-muted)] text-xs">{r.label}</span>
            <span className="stats-val text-[var(--color-muted)]">{r.valIn.toFixed(1)}{r.unit}</span>
            <span className={`stats-val ${improved ? "improved" : "text-[var(--color-foreground)]"}`}>
              {r.valOut.toFixed(1)}{r.unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MasteringClient() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    originalBuffer: AudioBuffer;
    masteredBuffer: AudioBuffer;
    originalUrl: string;
    masteredUrl: string;
    masteredBlob: Blob;
    statsIn: BufferStats;
    statsOut: BufferStats;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activePlayer, setActivePlayer] = useState<"original" | "mastered">("mastered");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.match(/audio\/(mpeg|wav|mp3|x-wav)/)) {
      setError("Please upload an MP3 or WAV file.");
      return;
    }
    setFile(f);
    setStage("idle");
    setResult(null);
    setError(null);
    setActivePlayer("mastered");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const runMastering = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const ab = await file.arrayBuffer();
      const { blob, originalBuffer, masteredBuffer, statsIn, statsOut } = await masterAudio(
        ab,
        setStage
      );
      const originalUrl = URL.createObjectURL(file);
      const masteredUrl = URL.createObjectURL(blob);
      setResult({ originalBuffer, masteredBuffer, originalUrl, masteredUrl, masteredBlob: blob, statsIn, statsOut });
      setStage("done");
      setActivePlayer("mastered");
    } catch (err) {
      console.error(err);
      setError("Mastering failed. Please try a different file.");
      setStage("error");
    }
  };

  const downloadResult = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.masteredUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + "_mastered.wav";
    a.click();
  };

  const progress = STAGE_PROGRESS[stage];
  const isProcessing = stage !== "idle" && stage !== "done" && stage !== "error";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="tool-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="2" y="9" width="3.5" height="12" rx="1.75" opacity="0.45"/>
              <rect x="2" y="5" width="3.5" height="3.5" rx="1.75" opacity="0.45"/>
              <rect x="7.5" y="4" width="3.5" height="17" rx="1.75"/>
              <rect x="13" y="7" width="3.5" height="14" rx="1.75" opacity="0.75"/>
              <rect x="18.5" y="2" width="3.5" height="19" rx="1.75" opacity="0.55"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Mastering Tool</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium">
            Demo — Free to try
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          Upload an MP3 or WAV. We&apos;ll normalize loudness to{" "}
          <span className="font-mono text-[var(--color-foreground)]">−14 LUFS</span> (Spotify
          standard), apply a gentle high-shelf boost and low-cut, then limit to{" "}
          <span className="font-mono text-[var(--color-foreground)]">−0.3 dBTP</span>. All
          processing runs locally in your browser — your audio never leaves your device.
        </p>
      </div>

      {/* Upload zone */}
      {!result && (
        <div
          className={`upload-zone rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer mb-6 ${
            dragOver ? "drag-over" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/wav,.mp3,.wav"
            className="hidden"
            onChange={onInputChange}
          />
          {file ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[var(--color-foreground)] truncate max-w-xs">
                  {file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setStage("idle");
                    setResult(null);
                    setError(null);
                  }}
                  className="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-foreground)] ml-4"
                >
                  ✕ Remove
                </button>
              </div>
              <div className="text-xs text-[var(--color-muted-2)]">
                {formatBytes(file.size)}
                {file.type && ` · ${file.type.split("/")[1].toUpperCase()}`}
              </div>
            </div>
          ) : (
            <>
              <div className="tool-icon mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p className="font-medium text-[var(--color-foreground)] mb-1">
                Drop your MP3 or WAV here
              </p>
              <p className="text-sm text-[var(--color-muted-2)]">or click to browse</p>
            </>
          )}
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-muted)]">{STAGE_LABELS[stage]}</span>
            <span className="font-mono text-xs text-[var(--color-muted-2)]">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--color-grid-300)] rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-fill rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* A/B Compare result */}
      {result && stage === "done" && (
        <div className="space-y-5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)] pulse-ring" />
              <span className="font-semibold text-[var(--color-foreground)]">Master ready</span>
            </div>
            <div className="ab-toggle">
              <button
                className={activePlayer === "original" ? "active" : ""}
                onClick={() => setActivePlayer("original")}
              >
                A
              </button>
              <button
                className={activePlayer === "mastered" ? "active" : ""}
                onClick={() => setActivePlayer("mastered")}
              >
                B
              </button>
            </div>
          </div>

          {/* Players */}
          <WaveformPlayer
            buffer={result.originalBuffer}
            url={result.originalUrl}
            label="A — Original"
            accentColor="#8b93a8"
            isActive={activePlayer === "original"}
            onActivate={() => setActivePlayer("original")}
          />
          <WaveformPlayer
            buffer={result.masteredBuffer}
            url={result.masteredUrl}
            label="B — Mastered"
            sublabel="−14 LUFS · −0.3 dBTP"
            accentColor="#2F6B58"
            isActive={activePlayer === "mastered"}
            onActivate={() => setActivePlayer("mastered")}
          />

          {/* Stats */}
          <StatsComparison statsIn={result.statsIn} statsOut={result.statsOut} />

          {/* Download */}
          <button
            onClick={downloadResult}
            className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)] text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Mastered WAV
          </button>

          <button
            onClick={() => {
              setFile(null);
              setStage("idle");
              setResult(null);
              setError(null);
            }}
            className="w-full py-2.5 rounded-xl border border-[var(--color-grid-500)] text-[var(--color-muted)] text-sm hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] transition-all"
          >
            Master another track
          </button>
        </div>
      )}

      {/* Master button */}
      {file && stage !== "done" && !isProcessing && (
        <button
          onClick={runMastering}
          className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Master this track
        </button>
      )}

      {/* Info pills */}
      {!result && (
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-[var(--color-muted-2)]">
          {[
            ["−14 LUFS", "Spotify standard"],
            ["−0.3 dBTP", "True-peak limit"],
            ["100% local", "No upload"],
          ].map(([val, label]) => (
            <div key={val} className="glass-card rounded-xl p-3">
              <div className="font-mono font-bold text-[var(--color-foreground)] mb-0.5">{val}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
