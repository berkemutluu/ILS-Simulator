import { useState, useCallback, useRef, useEffect } from "react";
import CDIInstrument from "@/components/CDIInstrument";
import ApproachView from "@/components/ApproachView";
import ApproachInfo from "@/components/ApproachInfo";
import GlideslopeView from "@/components/GlideslopeView";
import BeamStrengthDisplay from "@/components/BeamStrengthDisplay";

const Index = () => {
  const [aircraftX, setAircraftX] = useState(0.5);
  const [aircraftY, setAircraftY] = useState(0.35);
  const [autoland, setAutoland] = useState(false);
  const autolandRef = useRef(false);
  const animFrameRef = useRef<number>();

  const handleAircraftMove = useCallback((x: number, y: number) => {
    if (autolandRef.current) return; // Don't allow manual move during autoland
    setAircraftX(x);
    setAircraftY(y);
  }, []);

  const handleAircraftYChange = useCallback((y: number) => {
    if (autolandRef.current) return;
    setAircraftY(y);
  }, []);

  // Autoland animation
  useEffect(() => {
    autolandRef.current = autoland;
    if (!autoland) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (now: number) => {
      if (!autolandRef.current) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setAircraftX((prev) => {
        const target = 0.5;
        const diff = target - prev;
        return prev + diff * Math.min(1, dt * 1.5);
      });

      setAircraftY((prev) => {
        // Fly from current position toward runway (y=1.0) at steady rate
        const targetRate = 0.06; // units per second
        const newY = prev + targetRate * dt;
        if (newY >= 0.98) {
          // Landed
          autolandRef.current = false;
          setAutoland(false);
          return 0.98;
        }
        // Also correct toward glideslope (y where deviation = 0 means y = 0.5 maps to center)
        // The ideal Y for zero GS deviation is 0.5
        // But we want to fly the approach, so we smoothly descend
        return newY;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Reset to approach start
    setAircraftX(0.38);
    setAircraftY(0.15);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoland]);

  const localizerDeviation = (aircraftX - 0.5) * 2;
  const glideslopeDeviation = (0.5 - aircraftY) * 2;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-ils-green animate-pulse-glow" />
          <h1 className="font-mono text-lg md:text-xl text-primary glow-cyan tracking-wider uppercase">
            ILS Approach Simulator
          </h1>
        </div>
        <div className="flex items-center gap-4 ml-5">
          <p className="font-mono text-xs text-muted-foreground">
            LTFM RWY 34R — ILS Approach
          </p>
          <button
            onClick={() => setAutoland((a) => !a)}
            className={`font-mono text-xs px-3 py-1 rounded border transition-all ${
              autoland
                ? "bg-ils-green/20 border-ils-green text-ils-green glow-green"
                : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {autoland ? "✦ AUTOLAND ACTIVE" : "▶ AUTOLAND"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1400px] mx-auto">
        {/* Left: Approach View + Glideslope */}
        <div className="lg:col-span-7 space-y-4">
          <ApproachView aircraftX={aircraftX} aircraftY={aircraftY} onAircraftMove={handleAircraftMove} />
          <GlideslopeView deviation={glideslopeDeviation} aircraftY={aircraftY} onAircraftYChange={handleAircraftYChange} />
        </div>

        {/* Right: CDI + Beam + Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-center">
            <CDIInstrument
              localizerDeviation={localizerDeviation}
              glideslopeDeviation={glideslopeDeviation}
              frequency="109.30"
              course={344}
            />
          </div>
          <BeamStrengthDisplay localizerDeviation={localizerDeviation} glideslopeDeviation={glideslopeDeviation} />
          <ApproachInfo locDev={localizerDeviation} gsDev={glideslopeDeviation} />

          {/* Legend */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-mono text-xs text-primary glow-cyan tracking-widest uppercase">How It Works</h3>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              The <span className="text-primary">Localizer</span> provides lateral guidance using 90Hz and 150Hz modulated signals. The <span className="text-ils-green">Glideslope</span> provides vertical guidance on the correct descent path (typically 3°).
            </p>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-accent">Drag the aircraft</span> in either view to see how the CDI instrument, beam strengths, and deviation readings change in real time.
            </p>
            <div className="flex gap-4 pt-1">
              <LegendItem color="bg-ils-green" label="On path" />
              <LegendItem color="bg-ils-amber" label="Minor dev" />
              <LegendItem color="bg-ils-red" label="Major dev" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default Index;
