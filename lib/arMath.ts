export function angleDiff(a: number, b: number): number {
  let diff = ((a - b) + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
}

export function isInFov(
  featureBearing: number,
  deviceHeading: number,
  fovDeg = 90
): boolean {
  return Math.abs(angleDiff(featureBearing, deviceHeading)) <= fovDeg / 2;
}

export function bearingToScreenX(
  featureBearing: number,
  deviceHeading: number,
  screenWidth: number,
  fovDeg = 90
): number {
  const diff = angleDiff(featureBearing, deviceHeading);
  const normalized = diff / (fovDeg / 2); // -1 to 1
  return (screenWidth / 2) * (1 + normalized);
}

export function elevationToScreenY(
  distanceMeters: number,
  screenHeight: number
): number {
  // Closer features appear lower in the frame
  const ratio = Math.max(0, Math.min(1, 1 - distanceMeters / 500));
  return screenHeight * 0.3 + screenHeight * 0.4 * ratio;
}
