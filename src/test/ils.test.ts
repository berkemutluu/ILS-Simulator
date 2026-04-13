import { describe, expect, it } from "vitest";

import { getAltitudeOffsetFromPointer, getGlideslopeReferenceY, getPapiLights } from "@/lib/ils";

describe("ILS helpers", () => {
  it("descends toward the runway in side view", () => {
    expect(getGlideslopeReferenceY(40)).toBeLessThan(getGlideslopeReferenceY(480));
  });

  it("shows two white and two red PAPI lights on the glideslope", () => {
    expect(getPapiLights(0)).toEqual(["white", "white", "red", "red"]);
  });

  it("maps a pointer on the rendered glideslope to zero deviation", () => {
    const aircraftX = 260;
    const rect = {
      top: 10,
      height: 180,
    } as DOMRect;
    const gsY = getGlideslopeReferenceY(aircraftX);
    const clientY = rect.top + (gsY / 150) * rect.height;

    expect(getAltitudeOffsetFromPointer(clientY, rect, aircraftX)).toBeCloseTo(0, 5);
  });
});