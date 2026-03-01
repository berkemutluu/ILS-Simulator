interface ApproachInfoProps {
  locDev: number;
  gsDev: number;
}

export default function ApproachInfo({ locDev, gsDev }: ApproachInfoProps) {
  const formatDev = (d: number) => {
    const dots = Math.abs(d * 2).toFixed(1);
    const dir = d < -0.01 ? "L" : d > 0.01 ? "R" : "●";
    return { dots, dir };
  };

  const formatGsDev = (d: number) => {
    const dots = Math.abs(d * 2).toFixed(1);
    const dir = d < -0.01 ? "▼" : d > 0.01 ? "▲" : "●";
    return { dots, dir };
  };

  const loc = formatDev(locDev);
  const gs = formatGsDev(gsDev);

  const statusColor = (d: number) => {
    const abs = Math.abs(d);
    if (abs < 0.3) return "text-ils-green glow-green";
    if (abs < 0.7) return "text-ils-amber glow-amber";
    return "text-ils-red";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 box-glow-cyan space-y-4">
      <h3 className="font-mono text-xs text-primary glow-cyan tracking-widest uppercase">Approach Data</h3>

      <div className="grid grid-cols-2 gap-3">
        <InfoRow label="AIRPORT" value="KLAX" />
        <InfoRow label="RUNWAY" value="27L" />
        <InfoRow label="ILS FREQ" value="111.70" />
        <InfoRow label="COURSE" value="274°" />
        <InfoRow label="GS ANGLE" value="3.00°" />
        <InfoRow label="DA/DH" value="200ft" />
        <InfoRow label="TDZE" value="126ft" />
        <InfoRow label="CAT" value="CAT I" />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <h4 className="font-mono text-[10px] text-muted-foreground tracking-wider">DEVIATION</h4>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">LOC</span>
          <span className={`font-mono text-sm font-semibold ${statusColor(locDev)}`}>
            {loc.dots} dot {loc.dir}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">G/S</span>
          <span className={`font-mono text-sm font-semibold ${statusColor(gsDev)}`}>
            {gs.dots} dot {gs.dir}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <h4 className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">GUIDANCE</h4>
        <GuidanceMessage locDev={locDev} gsDev={gsDev} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

function GuidanceMessage({ locDev, gsDev }: { locDev: number; gsDev: number }) {
  const messages: string[] = [];

  const absLoc = Math.abs(locDev);
  const absGs = Math.abs(gsDev);

  if (absLoc < 0.15 && absGs < 0.15) {
    messages.push("✦ On centerline and on glideslope. Maintain current path.");
  } else {
    if (absLoc >= 0.15) {
      const dir = locDev < 0 ? "right" : "left";
      if (absLoc < 0.5) {
        messages.push(`↔ Slight ${locDev < 0 ? "left" : "right"} of centerline. Correct ${dir}.`);
      } else {
        messages.push(`⚠ Significant localizer deviation. Turn ${dir} to intercept.`);
      }
    }
    if (absGs >= 0.15) {
      const dir = gsDev < 0 ? "up" : "down";
      if (absGs < 0.5) {
        messages.push(`↕ Slightly ${gsDev < 0 ? "below" : "above"} glideslope. Adjust pitch ${dir}.`);
      } else {
        messages.push(`⚠ G/S deviation! Adjust vertical speed ${dir} immediately.`);
      }
    }
  }

  return (
    <div className="space-y-1">
      {messages.map((msg, i) => (
        <p key={i} className="font-mono text-xs text-secondary-foreground leading-relaxed">
          {msg}
        </p>
      ))}
    </div>
  );
}
