import { useCallback } from "react";
import { getAltitudeOffsetFromPointer, getGlideslopeReferenceY, getPapiLights } from "@/lib/ils";

interface GlideslopeViewProps {
  deviation: number; // -1 to 1
  aircraftY: number; // 0 to 1, distance along approach
  onAltitudeChange?: (offset: number) => void;
}

export default function GlideslopeView({ deviation, aircraftY, onAltitudeChange }: GlideslopeViewProps) {
  const acX = aircraftY * 440 + 40;
  const gsY = getGlideslopeReferenceY(acX);
  const acY = gsY - deviation * 40;
  const papiLights = getPapiLights(deviation);

  const updateAltitude = useCallback(
    (clientY: number, rect: DOMRect) => {
      if (!onAltitudeChange) return;
      onAltitudeChange(getAltitudeOffsetFromPointer(clientY, rect, acX));
    },
    [acX, onAltitudeChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!onAltitudeChange) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateAltitude(e.clientY, e.currentTarget.getBoundingClientRect());
    },
    [onAltitudeChange, updateAltitude]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.buttons !== 1 || !onAltitudeChange) return;
      updateAltitude(e.clientY, e.currentTarget.getBoundingClientRect());
    },
    [onAltitudeChange, updateAltitude]
  );

  // Marker beacon positions
  const markers = [
    { name: "IM", dist: 0.12, color: "hsl(var(--foreground))" },
    { name: "MM", dist: 0.35, color: "hsl(var(--ils-amber))" },
    { name: "OM", dist: 0.7, color: "hsl(var(--ils-cyan))" },
  ];

  return (
    <div className="relative w-full bg-card rounded-lg border border-border box-glow-cyan overflow-hidden" style={{ height: 180 }}>
      <div className="absolute top-2 left-3 font-mono text-xs text-primary glow-cyan z-10">
        GLIDESLOPE — SIDE VIEW
      </div>
      <div className="absolute top-2 right-3 font-mono text-[10px] text-muted-foreground z-10">
        DRAG TO ADJUST ALTITUDE
      </div>

      <svg
        viewBox="0 0 500 150"
        className="w-full h-full cursor-ns-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <defs>
          <linearGradient id="gsBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--ils-green))" stopOpacity={0.15} />
            <stop offset="100%" stopColor="hsl(var(--ils-green))" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Ground */}
        <rect x={0} y={120} width={500} height={30} fill="hsl(var(--ils-horizon))" opacity={0.3} />
        <line x1={0} y1={120} x2={500} y2={120} stroke="hsl(var(--ils-runway))" strokeWidth={1} opacity={0.4} />

        {/* Runway */}
        <rect x={400} y={110} width={80} height={10} fill="hsl(var(--ils-horizon))" stroke="hsl(var(--ils-runway))" strokeWidth={0.5} />

        {/* PAPI Lights */}
        {papiLights.map((light, i) => {
          const isRed = light === "red";
          const lampColor = isRed ? "hsl(var(--ils-red))" : "hsl(var(--foreground))";
          return (
            <g key={`papi-${i}`}>
              <rect
                x={392 - i * 8}
                y={108}
                width={5}
                height={3}
                fill={lampColor}
                opacity={0.9}
              />
              <rect
                x={392 - i * 8}
                y={108}
                width={5}
                height={3}
                fill={lampColor}
                opacity={0.3}
                style={{ filter: `drop-shadow(0 0 3px ${lampColor})` }}
              />
            </g>
          );
        })}

        {/* Glideslope beam */}
        <polygon points="480,115 0,20 0,50" fill="url(#gsBeam)" />

        {/* GS centerline */}
        <line x1={480} y1={115} x2={0} y2={35} stroke="hsl(var(--ils-green))" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />

        {/* Marker Beacons */}
        {markers.map((m) => {
          const x = 480 - m.dist * 480;
          return (
            <g key={m.name}>
              <line x1={x} y1={115} x2={x} y2={125} stroke={m.color} strokeWidth={1.5} opacity={0.7} />
              <polygon points={`${x - 4},125 ${x},118 ${x + 4},125`} fill={m.color} opacity={0.15} />
              <text x={x} y={133} fill={m.color} fontSize={7} fontFamily="JetBrains Mono" textAnchor="middle" opacity={0.8}>
                {m.name}
              </text>
            </g>
          );
        })}

        {/* Aircraft */}
        <g transform={`translate(${acX}, ${acY})`}>
          <circle r={10} fill="hsl(var(--ils-cyan))" opacity={0.08} />
          <polygon points="-8,0 0,-5 8,0 0,3" fill="hsl(var(--primary))" />
          <circle r={1.5} fill="hsl(var(--foreground))" />
        </g>

        {/* Altitude labels */}
        {[500, 1000, 1500, 2000].map((alt, i) => {
          const x = 400 - i * 90;
          return (
            <text key={alt} x={x} y={145} fill="hsl(var(--muted-foreground))" fontSize={8} fontFamily="JetBrains Mono" textAnchor="middle">
              {alt}ft
            </text>
          );
        })}

        {/* GS Transmitter */}
        <g transform="translate(470, 108)">
          <rect x={-3} y={0} width={6} height={12} fill="hsl(var(--ils-amber))" opacity={0.7} />
          <line x1={0} y1={0} x2={0} y2={-6} stroke="hsl(var(--ils-amber))" strokeWidth={1} />
          <circle cx={0} cy={-8} r={2} fill="hsl(var(--ils-amber))" className="animate-pulse-glow" />
        </g>
      </svg>
    </div>
  );
}
