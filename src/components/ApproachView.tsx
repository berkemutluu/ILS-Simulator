import { useCallback } from "react";
import { getPapiLights } from "@/lib/ils";

interface ApproachViewProps {
  aircraftX: number;
  aircraftY: number;
  glideslopeDeviation: number;
  onAircraftMove: (x: number, y: number) => void;
}

export default function ApproachView({ aircraftX, aircraftY, glideslopeDeviation, onAircraftMove }: ApproachViewProps) {
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
  const rwTopLeft = 240;
  const rwTopRight = 260;
  const rwBotLeft = 180;
  const rwBotRight = 320;

  const acX = aircraftX * 500;
  const acY = aircraftY * 400;
  const papiLights = getPapiLights(glideslopeDeviation);

  // Marker beacon positions
  const markers = [
    { name: "IM", y: runwayTopY - 22, color: "hsl(var(--foreground))" },
    { name: "MM", y: runwayTopY * 0.65, color: "hsl(var(--ils-amber))" },
    { name: "OM", y: runwayTopY * 0.3, color: "hsl(var(--ils-cyan))" },
  ];

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
        <polygon points={`250,${runwayTopY} 100,0 400,0`} fill="url(#beamGrad)" />

        {/* Localizer centerline */}
        <line x1={250} y1={0} x2={250} y2={runwayTopY} stroke="hsl(var(--ils-cyan))" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />

        {/* Beam edges */}
        <line x1={250} y1={runwayTopY} x2={100} y2={0} stroke="hsl(var(--ils-cyan))" strokeWidth={0.5} opacity={0.2} />
        <line x1={250} y1={runwayTopY} x2={400} y2={0} stroke="hsl(var(--ils-cyan))" strokeWidth={0.5} opacity={0.2} />

        {/* Marker Beacons */}
        {markers.map((m) => (
          <g key={m.name}>
            <line x1={140} y1={m.y} x2={360} y2={m.y} stroke={m.color} strokeWidth={0.5} strokeDasharray="3 5" opacity={0.3} />
            <rect x={140} y={m.y - 4} width={8} height={8} rx={1} fill={m.color} opacity={0.15} stroke={m.color} strokeWidth={0.5} />
            <text x={130} y={m.y + 3} fill={m.color} fontSize={8} fontFamily="JetBrains Mono" textAnchor="end" opacity={0.7}>
              {m.name}
            </text>
          </g>
        ))}

        {/* Runway - clean, no touchdown zone or white lines */}
        <polygon
          points={`${rwTopLeft},${runwayTopY} ${rwTopRight},${runwayTopY} ${rwBotRight},${runwayBottomY} ${rwBotLeft},${runwayBottomY}`}
          fill="hsl(var(--ils-horizon))"
          stroke="hsl(var(--ils-runway))"
          strokeWidth={1}
        />

        {/* Runway centerline dashes */}
        {Array.from({ length: 10 }, (_, i) => {
          const t = (i + 2) / 14;
          const y1 = runwayTopY + t * (runwayBottomY - runwayTopY);
          const y2 = y1 + 12;
          return (
            <line key={`cl-${i}`} x1={250} y1={y1} x2={250} y2={Math.min(y2, runwayBottomY - 10)} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.3} />
          );
        })}

        {/* PAPI lights — perpendicular to runway, on left side */}
        {papiLights.map((light, i) => {
          const papiY = runwayTopY + 30;
          const isRed = light === "red";
          const lampColor = isRed ? "hsl(var(--ils-red))" : "hsl(var(--foreground))";
          return (
            <circle
              key={`papi-${i}`}
              cx={rwTopLeft - 20 - i * 10}
              cy={papiY}
              r={3}
              fill={lampColor}
              opacity={isRed ? 0.85 : 0.7}
              style={{ filter: `drop-shadow(0 0 3px ${lampColor})` }}
            />
          );
        })}

        {/* Localizer antenna */}
        <g transform={`translate(250, ${runwayBottomY + 5})`}>
          <rect x={-15} y={0} width={30} height={3} fill="hsl(var(--ils-amber))" opacity={0.5} />
          <line x1={0} y1={3} x2={0} y2={10} stroke="hsl(var(--ils-amber))" strokeWidth={1} opacity={0.5} />
          <text x={0} y={20} fill="hsl(var(--ils-amber))" fontSize={7} fontFamily="JetBrains Mono" textAnchor="middle" opacity={0.6}>
            LOC ANT
          </text>
        </g>

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
          <circle r={16} fill="hsl(var(--ils-cyan))" opacity={0.08} />
          <polygon points="0,-10 -14,6 -4,4 0,10 4,4 14,6" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" strokeWidth={0.5} />
          <circle r={2} fill="hsl(var(--foreground))" />
        </g>

        {/* Labels */}
        <text x={250} y={runwayBottomY + 40} fill="hsl(var(--ils-runway))" fontSize={11} fontFamily="JetBrains Mono" textAnchor="middle">
          RWY 34R
        </text>
        <text x={250} y={runwayBottomY + 54} fill="hsl(var(--muted-foreground))" fontSize={9} fontFamily="JetBrains Mono" textAnchor="middle">
          ILS 34R — LOCALIZER BEAM
        </text>
      </svg>
    </div>
  );
}
