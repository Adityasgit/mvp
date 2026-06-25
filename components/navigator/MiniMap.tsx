"use client";

import type { CampusFeature } from "@/lib/types";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

interface Props {
  userPos: [number, number] | null;
  features: CampusFeature[];
  deviceHeading: number;
  selectedFeatureId: string | null;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

function buildFeatureCollection(
  features: CampusFeature[],
  selectedId: string | null
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features.map((f) => ({
      type: "Feature",
      id: f.id,
      geometry: toGeoGeometry(f),
      properties: {
        id: f.id,
        name: f.name,
        category: f.category,
        geometryType: f.geometryType,
        selected: f.id === selectedId,
      },
    })),
  };
}

function toGeoGeometry(f: CampusFeature): GeoJSON.Geometry {
  if (f.geometryType === "point") {
    return { type: "Point", coordinates: f.coordinates as [number, number] };
  }
  if (f.geometryType === "line") {
    return { type: "LineString", coordinates: f.coordinates as [number, number][] };
  }
  return { type: "Polygon", coordinates: f.coordinates as [number, number][][] };
}

function buildHeadingSource(
  userPos: [number, number],
  headingDeg: number
): GeoJSON.FeatureCollection {
  const R = 0.0003;
  const rad = ((headingDeg - 90) * Math.PI) / 180;
  const endLng = userPos[0] + R * Math.cos(rad);
  const endLat = userPos[1] + R * Math.sin(rad);
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [userPos, [endLng, endLat]],
        },
        properties: {},
      },
    ],
  };
}

function createUserDot(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width:14px; height:14px;
    border-radius:50%;
    background:#3b82f6;
    border:2px solid #fff;
    box-shadow:0 0 0 0 rgba(59,130,246,0.6);
    animation:pulse-ring 1.8s ease-out infinite;
  `;
  return el;
}

export default function MiniMap({
  userPos,
  features,
  deviceHeading,
  selectedFeatureId,
  expanded = false,
  onToggleExpand,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const loadedRef = useRef(false);

  // Initialize map once
  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userPos ?? [77.209, 28.6139],
      zoom: 17,
      attributionControl: false,
      logoPosition: "bottom-left",
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      loadedRef.current = true;

      // Campus features source
      map.addSource("campus-features", {
        type: "geojson",
        data: buildFeatureCollection(features, selectedFeatureId),
      });

      // Polygons
      map.addLayer({
        id: "campus-polygons-fill",
        type: "fill",
        source: "campus-features",
        filter: ["==", ["get", "geometryType"], "polygon"],
        paint: {
          "fill-color": ["case", ["get", "selected"], "#facc15", "#a855f7"],
          "fill-opacity": 0.25,
        },
      });
      map.addLayer({
        id: "campus-polygons-line",
        type: "line",
        source: "campus-features",
        filter: ["==", ["get", "geometryType"], "polygon"],
        paint: {
          "line-color": ["case", ["get", "selected"], "#facc15", "#a855f7"],
          "line-width": 1.5,
        },
      });

      // Lines
      map.addLayer({
        id: "campus-lines",
        type: "line",
        source: "campus-features",
        filter: ["==", ["get", "geometryType"], "line"],
        paint: {
          "line-color": ["case", ["get", "selected"], "#facc15", "#22c55e"],
          "line-width": 2.5,
          "line-dasharray": [2, 1],
        },
      });

      // Points
      map.addLayer({
        id: "campus-points",
        type: "circle",
        source: "campus-features",
        filter: ["==", ["get", "geometryType"], "point"],
        paint: {
          "circle-radius": ["case", ["get", "selected"], 9, 6],
          "circle-color": ["case", ["get", "selected"], "#facc15", "#3b82f6"],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1.5,
        },
      });

      // Labels
      map.addLayer({
        id: "campus-labels",
        type: "symbol",
        source: "campus-features",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#1f2937",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      });

      // Heading source + layer
      map.addSource("user-heading", {
        type: "geojson",
        data: userPos
          ? buildHeadingSource(userPos, deviceHeading)
          : { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "user-heading-line",
        type: "line",
        source: "user-heading",
        paint: {
          "line-color": "#93c5fd",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    });

    // User marker
    if (userPos) {
      const dot = createUserDot();
      const marker = new mapboxgl.Marker({ element: dot })
        .setLngLat(userPos)
        .addTo(map);
      markerRef.current = marker;
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize map when expanded changes
  useEffect(() => {
    setTimeout(() => mapRef.current?.resize(), 50);
  }, [expanded]);

  // Update user position + heading
  useEffect(() => {
    if (!userPos) return;
    const map = mapRef.current;

    // Marker
    if (markerRef.current) {
      markerRef.current.setLngLat(userPos);
    } else if (map) {
      const dot = createUserDot();
      markerRef.current = new mapboxgl.Marker({ element: dot })
        .setLngLat(userPos)
        .addTo(map);
    }

    // Pan
    map?.easeTo({ center: userPos, duration: 500 });

    // Heading line
    if (loadedRef.current && map) {
      (map.getSource("user-heading") as mapboxgl.GeoJSONSource)?.setData(
        buildHeadingSource(userPos, deviceHeading)
      );
    }
  }, [userPos, deviceHeading]);

  // Update features when data or selection changes
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return;
    (mapRef.current.getSource("campus-features") as mapboxgl.GeoJSONSource)?.setData(
      buildFeatureCollection(features, selectedFeatureId)
    );
  }, [features, selectedFeatureId]);

  if (!TOKEN) {
    return (
      <div className="rounded-xl bg-gray-900/90 text-gray-400 text-xs p-3 w-56 flex flex-col gap-1">
        <p className="font-semibold text-white">Map unavailable</p>
        <p>Add <code className="text-yellow-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> to <code>.env.local</code> and restart.</p>
      </div>
    );
  }

  return (
    <>
      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>

      <div
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
          expanded ? "w-80 h-80" : "w-56 h-56"
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* Expand / collapse button */}
        <button
          onClick={onToggleExpand}
          className="absolute top-1.5 left-1.5 z-10 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm transition-colors"
        >
          {expanded ? "⊡" : "⊞"}
        </button>
      </div>
    </>
  );
}
