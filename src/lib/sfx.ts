// SFX 8-bit: "click" breve via WebAudio (square wave)
let _ctx: AudioContext | null = null;

export function playClick(muted: boolean) {
  if (muted) return;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  _ctx = _ctx || new AC();
  const t = _ctx.currentTime;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(880, t);          // A5
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

  osc.connect(gain).connect(_ctx.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}
