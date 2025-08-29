// SFX 8-bit via WebAudio (square/noise)
let _ctx: AudioContext | undefined;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC: any =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;

  // crea un ctx locale certo e poi sincronizza _ctx
  const ctx: AudioContext = _ctx ?? new AC();
  _ctx = ctx;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function playClick(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}

export function playInsert(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const n = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(220, t);
  o.frequency.linearRampToValueAtTime(110, t + 0.12);
  n.type = "square";
  n.frequency.setValueAtTime(55, t);
  n.frequency.linearRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g);
  n.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  n.start(t);
  o.stop(t + 0.15);
  n.stop(t + 0.15);
}

export function playBootTick(muted: boolean, step = 1) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const base = 660 + step * 40;
  osc.type = "square";
  osc.frequency.setValueAtTime(base, t);
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

export function playTypeTick(muted: boolean) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(980, t);
  g.gain.setValueAtTime(0.02, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}
