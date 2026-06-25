"use client";

import { bearingToScreenX, elevationToScreenY, isInFov } from "@/lib/arMath";
import { bearing, featurePoint, formatDistance, haversineDistance } from "@/lib/geometry";
import type { CampusFeature } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  userPos: [number, number] | null;
  deviceHeading: number;
  features: CampusFeature[];
  selectedFeatureId: string | null;
  onSelectFeature: (f: CampusFeature) => void;
  maxRangeMeters?: number;
  fovDeg?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  canteen: "🍽️",
  gate: "🚪",
  entrance: "🚪",
  road: "🛣️",
  path: "🚶",
  building: "🏢",
  hostel: "🏠",
  library: "📚",
  parking: "🅿️",
  other: "📍",
  point: "📍",
  line: "〰️",
  polygon: "⬜",
};

export default function ArOverlay({
  userPos,
  deviceHeading,
  features,
  selectedFeatureId,
  onSelectFeature,
  maxRangeMeters = 200,
  fovDeg = 90,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const visibleFeatures = userPos
    ? features
        .filter((f) => f.ar.showInAr)
        .map((f) => {
          const pt = featurePoint(f);
          const dist = haversineDistance(userPos, pt);
          const bear = bearing(userPos, pt);
          const inFov = isInFov(bear, deviceHeading, fovDeg);
          const x = dims.w > 0 ? bearingToScreenX(bear, deviceHeading, dims.w, fovDeg) : 0;
          const y = dims.h > 0 ? elevationToScreenY(dist, dims.h) : 0;
          return { f, dist, bear, inFov, x, y };
        })
        .filter((item) => item.dist <= maxRangeMeters && item.inFov)
        .sort((a, b) => b.f.ar.priority - a.f.ar.priority)
    : [];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {visibleFeatures.map(({ f, dist, x, y }) => {
        const isSelected = f.id === selectedFeatureId;
        const icon = CATEGORY_ICONS[f.category] ?? CATEGORY_ICONS[f.geometryType] ?? "📍";

        return (
          <button
            key={f.id}
            onClick={() => onSelectFeature(f)}
            style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
            className={`absolute pointer-events-auto transition-all duration-200 ${
              isSelected ? "scale-110" : ""
            }`}
          >
            <div
              className={`flex flex-col items-center gap-0.5 ${
                isSelected ? "drop-shadow-lg" : "drop-shadow-md"
              }`}
            >
              {/* Arrow pointing down to feature */}
              <div
                className={`text-base leading-none ${
                  isSelected ? "text-yellow-300" : "text-white"
                }`}
              >
                ▼
              </div>
              {/* Label card */}
              <div
                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap backdrop-blur-sm ${
                  isSelected
                    ? "bg-yellow-400 text-gray-900 ring-2 ring-yellow-200"
                    : "bg-black/70 text-white"
                }`}
              >
                <span className="mr-1">{icon}</span>
                {f.ar.label || f.name}
                {f.ar.displayDistance && (
                  <span
                    className={`ml-1.5 text-xs font-normal ${
                      isSelected ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {formatDistance(dist)}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* No location fallback */}
      {!userPos && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
            Waiting for location…
          </div>
        </div>
      )}
    </div>
  );
}
