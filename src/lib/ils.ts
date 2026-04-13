export type PapiLightState = "red" | "white";

export const GLIDESLOPE_VIEWBOX_HEIGHT = 150;

const GLIDESLOPE_LINE_START_X = 0;
const GLIDESLOPE_LINE_END_X = 480;
const GLIDESLOPE_LINE_START_Y = 35;
const GLIDESLOPE_LINE_END_Y = 115;
const GLIDESLOPE_DEVIATION_PIXELS = 40;

export function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function clampSigned(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function getGlideslopeReferenceY(x: number) {
  const clampedX = Math.max(GLIDESLOPE_LINE_START_X, Math.min(GLIDESLOPE_LINE_END_X, x));
  const progress = (clampedX - GLIDESLOPE_LINE_START_X) / (GLIDESLOPE_LINE_END_X - GLIDESLOPE_LINE_START_X);

  return GLIDESLOPE_LINE_START_Y + progress * (GLIDESLOPE_LINE_END_Y - GLIDESLOPE_LINE_START_Y);
}

export function getAltitudeOffsetFromPointer(clientY: number, rect: DOMRect, aircraftX: number) {
  const svgY = clampUnit((clientY - rect.top) / rect.height) * GLIDESLOPE_VIEWBOX_HEIGHT;
  const gsY = getGlideslopeReferenceY(aircraftX);

  return clampSigned((gsY - svgY) / GLIDESLOPE_DEVIATION_PIXELS);
}

export function getPapiLights(deviation: number): PapiLightState[] {
  const clampedDeviation = clampSigned(deviation);
  const thresholds = [-0.375, -0.125, 0.125, 0.375];

  return thresholds.map((threshold) => (clampedDeviation < threshold ? "red" : "white"));
}