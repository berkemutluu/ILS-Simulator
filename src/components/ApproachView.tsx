import { useCallback } from "react";

interface ApproachViewProps {
  aircraftX: number; // 0 to 1 (left to right, 0.5 = centerline)
  aircraftY: number; // 0 to 1 (top to bottom, represents altitude/distance)
  onAircraftMove: (x: number, y: number) => void;
}

export default function ApproachView({ aircraftX, aircraftY, onAircraftMove }: ApproachViewProps) {
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.buttons !== 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onAircraftMove(x, y);
    },
    [onAircraftMove]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onAircraftMove(x, y);
    },
    [onAircraftMove]
  );

  const runwayTopY = 180;
  const runwayBottomY = 380;
  const runwayLeftX = 230;
  const runwayRightX = 270;

  // Perspective runway
  const rwTopLeft = 240;
  const rwTopRight = 260;
  const rwBotLeft = 180;
  const rwBotRight = 320;

  const acX = aircraftX * 500;
  const acY = aircraftY * 400;

  return (
    <div className="relative w-full aspect-[5/4] bg-card rounded-lg border border-border box-glow-cyan overflow-hidden">
      <div className="absolute top-3 left-3 font-mono text-xs text-primary glow-cyan z-10">
        APPROACH VIEW — TOP DOWN
      </div>
      <div className="absolute top-3 right-3 font-mono text-[10px] text-muted-foreground z-10">
        DRAG AIRCRAFT TO EXPLORE
      </div>

      <svg
        viewBox="0 0 500 400"
        className="w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.3} />
          </pattern>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--ils-cyan))" stopOpacity={0.02} />
            <stop offset="100%" stopColor="hsl(var(--ils-cyan))" stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <rect width="500" height="400" fill="url(#grid)" />

        {/* Localizer beam cone */}
        <polygon
          points={`250,${runwayTopY} 100,0 400,0`}
          fill="url(#beamGrad)"
        />

        {/* Localizer centerline */}
        <line x1={250} y1={0} x2={250} y2={runwayTopY} stroke="hsl(var(--ils-cyan))" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />

        {/* Beam edges */}
        <line x1={250} y1={runwayTopY} x2={100} y2={0} stroke="hsl(var(--ils-cyan))" strokeWidth={0.5} opacity={0.2} />
        <line x1={250} y1={runwayTopY} x2={400} y2={0} stroke="hsl(var(--ils-cyan))" strokeWidth={0.5} opacity={0.2} />

        {/* Runway */}
        <polygon
          points={`${rwTopLeft},${runwayTopY} ${rwTopRight},${runwayTopY} ${rwBotRight},${runwayBottomY} ${rwBotLeft},${runwayBottomY}`}
          fill="hsl(var(--ils-horizon))"
          stroke="hsl(var(--ils-runway))"
          strokeWidth={1}
        />

        {/* Runway centerline */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const t = i / 8;
          const y1 = runwayTopY + t * (runwayBottomY - runwayTopY) + 5;
          const y2 = y1 + 15;
          const cx = 250;
          return (
            <line key={i} x1={cx} y1={y1} x2={cx} y2={Math.min(y2, runwayBottomY - 5)} stroke="hsl(var(--foreground))" strokeWidth={1.5} opacity={0.5} />
          );
        })}

        {/* Threshold markings */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <line key={`th-${i}`} x1={240 + i * 5} y1={runwayTopY} x2={235 + i * 8} y2={runwayTopY + 20} stroke="hsl(var(--foreground))" strokeWidth={1.5} opacity={0.6} />
        ))}

        {/* Distance markers */}
        {[1, 2, 3].map((nm) => {
          const y = runwayTopY - (nm / 3) * runwayTopY;
          return (
            <g key={`dm-${nm}`}>
              <line x1={20} y1={y} x2={480} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2 6" opacity={0.3} />
              <text x={485} y={y + 4} fill="hsl(var(--muted-foreground))" fontSize={9} fontFamily="JetBrains Mono" textAnchor="end">
                {nm}nm
              </text>
            </g>
          );
        })}

        {/* Aircraft symbol */}
        <g transform={`translate(${acX}, ${acY})`}>
          {/* Glow */}
          <circle r={16} fill="hsl(var(--ils-cyan))" opacity={0.08} />
          {/* Aircraft */}
          <polygon points="0,-10 -14,6 -4,4 0,10 4,4 14,6" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={0.5} />
          {/* Dot */}
          <circle r={2} fill="hsl(var(--foreground))" />
        </g>

        {/* Labels */}
        <text x={250} y={runwayBottomY + 20} fill="hsl(var(--ils-runway))" fontSize={11} fontFamily="JetBrains Mono" textAnchor="middle">
          RWY 27L
        </text>
        <text x={250} y={runwayBottomY + 34} fill="hsl(var(--muted-foreground))" fontSize={9} fontFamily="JetBrains Mono" textAnchor="middle">
          ILS 27L — LOCALIZER BEAM
        </text>
      </svg>
    </div>
  );
}
