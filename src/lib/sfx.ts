// SFX 8-bit: "click" breve via WebAudio (square wave)
let _ctx: AudioContext | null = null;

export function playClick(muted: boolean) {
  if (muted) return;
  if (typeof window === "undefined") return;

  // AudioContext cross-browser (Safari usa webkitAudioContext)
  const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;

  if (!_ctx) _ctx = new AC();
  const ctx = _ctx as AudioContext;

  // Sblocca in caso di stato "suspended" (mobile/Safari)
  if (ctx.state === "suspended") {
    // best effort; ignora eventuali errori
    ctx.resume().catch(() => {});
  }

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(880, t);                 // A5
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);

  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.09);
}
