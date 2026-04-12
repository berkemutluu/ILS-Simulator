interface BeamStrengthDisplayProps {
  localizerDeviation: number; // -1 to 1
  glideslopeDeviation: number; // -1 to 1
}

export default function BeamStrengthDisplay({ localizerDeviation, glideslopeDeviation }: BeamStrengthDisplayProps) {
  // ILS beam modulation:
  // 90Hz dominates on one side, 150Hz on the other
  // DDM (Difference in Depth of Modulation) = |mod90 - mod150|
  // On centerline: 90Hz = 150Hz (DDM = 0)
  // Left of course: 90Hz > 150Hz
  // Right of course: 150Hz > 90Hz
  // Above GS: 90Hz > 150Hz
  // Below GS: 150Hz > 90Hz

  const loc90 = Math.max(0, Math.min(1, 0.5 + localizerDeviation * -0.5));
  const loc150 = Math.max(0, Math.min(1, 0.5 + localizerDeviation * 0.5));
  const gs90 = Math.max(0, Math.min(1, 0.5 + glideslopeDeviation * 0.5));
  const gs150 = Math.max(0, Math.min(1, 0.5 + glideslopeDeviation * -0.5));

  const locDDM = Math.abs(loc90 - loc150);
  const gsDDM = Math.abs(gs90 - gs150);

  return (
    <div className="bg-card border border-border rounded-lg p-4 box-glow-cyan space-y-4">
      <h3 className="font-mono text-xs text-primary glow-cyan tracking-widest uppercase">
        Beam Modulation
      </h3>

      {/* Localizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider">LOCALIZER</span>
          <span className="font-mono text-[10px] text-muted-foreground">DDM {(locDDM * 100).toFixed(1)}%</span>
        </div>
        <BeamBar label="90 Hz" value={loc90} color="hsl(var(--ils-cyan))" />
        <BeamBar label="150 Hz" value={loc150} color="hsl(var(--ils-amber))" />
        <div className="font-mono text-[10px] text-muted-foreground">
          {localizerDeviation < -0.05 ? "← 90Hz dominant (fly right)" :
           localizerDeviation > 0.05 ? "150Hz dominant (fly left) →" :
           "● Balanced — on centerline"}
        </div>
      </div>

      {/* Glideslope */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider">GLIDESLOPE</span>
          <span className="font-mono text-[10px] text-muted-foreground">DDM {(gsDDM * 100).toFixed(1)}%</span>
        </div>
        <BeamBar label="90 Hz" value={gs90} color="hsl(var(--ils-cyan))" />
        <BeamBar label="150 Hz" value={gs150} color="hsl(var(--ils-amber))" />
        <div className="font-mono text-[10px] text-muted-foreground">
          {glideslopeDeviation > 0.05 ? "▲ 90Hz dominant (fly down)" :
           glideslopeDeviation < -0.05 ? "150Hz dominant (fly up) ▼" :
           "● Balanced — on glideslope"}
        </div>
      </div>
    </div>
  );
}

function BeamBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-150"
          style={{ width: `${value * 100}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}
