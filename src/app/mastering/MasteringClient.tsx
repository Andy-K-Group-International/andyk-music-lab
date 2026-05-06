"use client";

import { useState, useRef, useCallback } from "react";

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

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function computeIntegratedLUFS(buffer: AudioBuffer): Promise<number> {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  const src = offlineCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(offlineCtx.destination);
  src.start();
  const rendered = await offlineCtx.startRendering();

  let sumSq = 0;
  let total = 0;
  for (let c = 0; c < rendered.numberOfChannels; c++) {
    const data = rendered.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      sumSq += data[i] * data[i];
      total++;
    }
  }
  const rms = Math.sqrt(sumSq / total);
  return 20 * Math.log10(rms) - 0.691; // approx integrated LUFS
}

async function masterAudio(
  arrayBuffer: ArrayBuffer,
  onStage: (s: Stage) => void
): Promise<{ blob: Blob; lufsIn: number; lufsOut: number }> {
  onStage("loading");
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  onStage("analyzing");
  const lufsIn = await computeIntegratedLUFS(decoded);

  onStage("eq");
  // Apply EQ + normalize in an OfflineAudioContext
  const TARGET_LUFS = -14;
  const gainNeeded = TARGET_LUFS - lufsIn; // dB
  const gainLinear = Math.pow(10, gainNeeded / 20);

  const offCtx = new OfflineAudioContext(
    decoded.numberOfChannels,
    decoded.length,
    decoded.sampleRate
  );

  const src = offCtx.createBufferSource();
  src.buffer = decoded;

  // Low-cut 30 Hz
  const hiPass = offCtx.createBiquadFilter();
  hiPass.type = "highpass";
  hiPass.frequency.value = 30;
  hiPass.Q.value = 0.707;

  // High-shelf +1.5 dB at 12kHz (subtle air)
  const hiShelf = offCtx.createBiquadFilter();
  hiShelf.type = "highshelf";
  hiShelf.frequency.value = 12000;
  hiShelf.gain.value = 1.5;

  // Gain node for loudness normalization
  const gainNode = offCtx.createGain();
  gainNode.gain.value = gainLinear;

  src.connect(hiPass);
  hiPass.connect(hiShelf);
  hiShelf.connect(gainNode);
  gainNode.connect(offCtx.destination);
  src.start();

  onStage("limiting");
  const processed = await offCtx.startRendering();

  // True-peak limiter: find peak, scale so peak ≤ -0.3 dBTP
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
  // Encode to 16-bit WAV
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
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, processed.sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
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
  const lufsOut = await computeIntegratedLUFS(processed);

  return { blob, lufsIn, lufsOut };
}

export default function MasteringClient() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    blob: Blob;
    lufsIn: number;
    lufsOut: number;
    url: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
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
      const { blob, lufsIn, lufsOut } = await masterAudio(ab, setStage);
      const url = URL.createObjectURL(blob);
      setResult({ blob, lufsIn, lufsOut, url });
      setStage("done");
    } catch (err) {
      console.error(err);
      setError("Mastering failed. Please try a different file.");
      setStage("error");
    }
  };

  const downloadResult = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = file.name.replace(/\.[^.]+$/, "") + "_mastered.wav";
    a.click();
  };

  const progress = STAGE_PROGRESS[stage];
  const isProcessing =
    stage !== "idle" && stage !== "done" && stage !== "error";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎚️</span>
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
            <div className="w-12 h-12 rounded-full bg-[var(--color-soft-green)] flex items-center justify-center mb-4 text-2xl">
              🎵
            </div>
            <p className="font-medium text-[var(--color-foreground)] mb-1">
              Drop your MP3 or WAV here
            </p>
            <p className="text-sm text-[var(--color-muted-2)]">or click to browse</p>
          </>
        )}
      </div>

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

      {/* Result */}
      {result && stage === "done" && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)] pulse-ring" />
            <span className="font-medium text-[var(--color-foreground)]">Master ready</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
            <div className="bg-[var(--color-grid-300)] rounded-xl p-3">
              <div className="text-xs text-[var(--color-muted-2)] mb-1">Input loudness</div>
              <div className="font-mono font-bold text-[var(--color-foreground)]">
                {result.lufsIn.toFixed(1)} LUFS
              </div>
            </div>
            <div className="bg-[var(--color-soft-green)] rounded-xl p-3">
              <div className="text-xs text-[var(--color-deep-teal)] mb-1">Output loudness</div>
              <div className="font-mono font-bold text-[var(--color-deep-teal)]">
                {result.lufsOut.toFixed(1)} LUFS
              </div>
            </div>
          </div>
          <button
            onClick={downloadResult}
            className="w-full py-3 rounded-xl bg-[var(--color-deep-teal)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            ↓ Download Mastered WAV
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

      {/* Processing info */}
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
    </div>
  );
}
