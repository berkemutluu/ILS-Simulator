import { useCallback } from "react";

interface CDIInstrumentProps {
  localizerDeviation: number; // -1 to 1 (left to right)
  glideslopeDeviation: number; // -1 to 1 (below to above)
  frequency: string;
  course: number;
}

export default function CDIInstrument({ localizerDeviation, glideslopeDeviation, frequency, course }: CDIInstrumentProps) {
  const dotSpacing = 28;
  const maxDots = 2;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  const locNeedleX = clamp(localizerDeviation) * (maxDots * dotSpacing);
  const gsNeedleY = clamp(glideslopeDeviation) * (maxDots * dotSpacing);

  const getDeviationColor = useCallback((dev: number) => {
    const abs = Math.abs(dev);
    if (abs < 0.3) return "hsl(var(--ils-green))";
    if (abs < 0.7) return "hsl(var(--ils-amber))";
    return "hsl(var(--ils-red))";
  }, []);

  return (
    <div className="relative w-[280px] h-[280px] rounded-full bg-card border-2 border-border box-glow-cyan flex items-center justify-center">
      {/* Outer ring */}
      <div className="absolute inset-2 rounded-full border border-border/50" />

      {/* Frequency & Course */}
      <div className="absolute top-5 left-0 right-0 text-center">
        <span className="font-mono text-xs text-primary glow-cyan">{frequency} MHz</span>
      </div>
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <span className="font-mono text-xs text-primary glow-cyan">CRS {course.toString().padStart(3, "0")}°</span>
      </div>

      <svg viewBox="-80 -80 160 160" className="w-[220px] h-[220px]">
        {/* Localizer dots (horizontal) */}
        {[-2, -1, 1, 2].map((i) => (
          <circle key={`loc-${i}`} cx={i * dotSpacing} cy={0} r={3} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} opacity={0.4} />
        ))}

        {/* Glideslope dots (vertical) */}
        {[-2, -1, 1, 2].map((i) => (
          <circle key={`gs-${i}`} cx={0} cy={i * dotSpacing} r={3} fill="none" stroke="hsl(var(--foreground))" strokeWidth={1} opacity={0.4} />
        ))}

        {/* Center crosshair */}
        <line x1={-8} y1={0} x2={8} y2={0} stroke="hsl(var(--foreground))" strokeWidth={1} opacity={0.3} />
        <line x1={0} y1={-8} x2={0} y2={8} stroke="hsl(var(--foreground))" strokeWidth={1} opacity={0.3} />

        {/* Localizer needle (vertical bar moves left/right) */}
        <line
          x1={locNeedleX} y1={-55} x2={locNeedleX} y2={55}
          stroke={getDeviationColor(localizerDeviation)}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Glideslope needle (horizontal bar moves up/down) */}
        <line
          x1={-55} y1={gsNeedleY} x2={55} y2={gsNeedleY}
          stroke={getDeviationColor(glideslopeDeviation)}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Aircraft symbol at center */}
        <g stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="none">
          <line x1={-12} y1={0} x2={-4} y2={0} />
          <line x1={4} y1={0} x2={12} y2={0} />
          <line x1={0} y1={-2} x2={0} y2={6} />
          <line x1={-5} y1={5} x2={5} y2={5} />
        </g>
      </svg>

      {/* Labels */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <span className="font-mono text-[10px] text-muted-foreground">LOC</span>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <span className="font-mono text-[10px] text-muted-foreground">LOC</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-[90px]">
        <span className="font-mono text-[10px] text-muted-foreground">GS</span>
      </div>
    </div>
  );
}
