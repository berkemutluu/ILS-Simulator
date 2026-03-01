import { useState, useCallback } from "react";
import CDIInstrument from "@/components/CDIInstrument";
import ApproachView from "@/components/ApproachView";
import ApproachInfo from "@/components/ApproachInfo";
import GlideslopeView from "@/components/GlideslopeView";

const Index = () => {
  const [aircraftX, setAircraftX] = useState(0.5);
  const [aircraftY, setAircraftY] = useState(0.35);

  const handleAircraftMove = useCallback((x: number, y: number) => {
    setAircraftX(x);
    setAircraftY(y);
  }, []);

  // Calculate deviations: 0.5 = on centerline, deviation scales from -1 to 1
  const localizerDeviation = (aircraftX - 0.5) * 2;
  const glideslopeDeviation = (0.5 - aircraftY) * 2; // inverted: high Y = low alt

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-ils-green animate-pulse-glow" />
          <h1 className="font-mono text-lg md:text-xl text-primary glow-cyan tracking-wider uppercase">
            ILS Approach Simulator
          </h1>
        </div>
        <p className="font-mono text-xs text-muted-foreground ml-5">
          Instrument Landing System — Localizer & Glideslope Guidance
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1400px] mx-auto">
        {/* Left: Approach View + Glideslope */}
        <div className="lg:col-span-7 space-y-4">
          <ApproachView aircraftX={aircraftX} aircraftY={aircraftY} onAircraftMove={handleAircraftMove} />
          <GlideslopeView deviation={glideslopeDeviation} aircraftY={aircraftY} />
        </div>

        {/* Right: CDI + Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-center">
            <CDIInstrument
              localizerDeviation={localizerDeviation}
              glideslopeDeviation={glideslopeDeviation}
              frequency="111.70"
              course={274}
            />
          </div>
          <ApproachInfo locDev={localizerDeviation} gsDev={glideslopeDeviation} />

          {/* Legend */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-mono text-xs text-primary glow-cyan tracking-widest uppercase">How It Works</h3>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              The <span className="text-primary">Localizer</span> provides lateral guidance, keeping the aircraft aligned with the runway centerline. The <span className="text-ils-green">Glideslope</span> provides vertical guidance on the correct descent path (typically 3°).
            </p>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-accent">Drag the aircraft</span> in the approach view to see how the CDI instrument and deviation readings change in real time.
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
