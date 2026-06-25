"use client";

import { useEffect, useState } from "react";

export interface LocationState {
  lat: number;
  lng: number;
  heading: number | null;
  accuracy: number;
}

interface Props {
  onLocation: (loc: LocationState) => void;
  showBadge?: boolean;
  debugMode?: boolean;
}

export default function CurrentLocation({ onLocation, showBadge, debugMode }: Props) {
  const [loc, setLoc] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const state: LocationState = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
        };
        setLoc(state);
        onLocation(state);
        setError(null);
      },
      (err) => {
        setError(`Location unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showBadge && !debugMode) return null;

  return (
    <div className="absolute top-16 left-3 right-3 pointer-events-none z-20">
      {error ? (
        <div className="bg-red-900/80 text-white text-xs px-3 py-1.5 rounded-full inline-block backdrop-blur-sm">
          {error}
        </div>
      ) : loc ? (
        <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full inline-block backdrop-blur-sm space-x-2">
          <span>{loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</span>
          {debugMode && (
            <>
              <span className="text-gray-400">|</span>
              <span>±{Math.round(loc.accuracy)}m</span>
              {loc.heading !== null && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>hdg {Math.round(loc.heading)}°</span>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full inline-block backdrop-blur-sm">
          Locating…
        </div>
      )}
    </div>
  );
}
