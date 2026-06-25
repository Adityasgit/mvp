"use client";

import { featurePoint, formatDistance, haversineDistance } from "@/lib/geometry";
import type { CampusFeature } from "@/lib/types";

interface Props {
  feature: CampusFeature;
  userPos: [number, number] | null;
  onDeselect: () => void;
}

export default function FeatureCard({ feature: f, userPos, onDeselect }: Props) {
  const dist = userPos ? haversineDistance(userPos, featurePoint(f)) : null;

  return (
    <div className="absolute bottom-20 left-3 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{f.name}</p>
          <p className="text-xs text-gray-500 capitalize">{f.category} · {f.geometryType}</p>
          {f.description && (
            <p className="text-sm text-gray-600 mt-1">{f.description}</p>
          )}
          {dist !== null && (
            <p className="text-sm font-medium text-blue-600 mt-1">{formatDistance(dist)} away</p>
          )}
          {f.blockCode && (
            <p className="text-xs text-gray-400 mt-0.5">Block: {f.blockCode}</p>
          )}
        </div>
        <button
          onClick={onDeselect}
          className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
