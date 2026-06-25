"use client";

import { importGeoJson } from "@/lib/geojson";
import type { CampusFeature } from "@/lib/types";
import { useState } from "react";

interface Props {
  onImport: (features: CampusFeature[]) => void;
}

export default function GeoJsonImporter({ onImport }: Props) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [open, setOpen] = useState(false);

  function handleImport() {
    setStatus(null);
    try {
      const features = importGeoJson(text.trim());
      if (features.length === 0) {
        setStatus({ type: "error", msg: "No valid features found in the GeoJSON" });
        return;
      }
      onImport(features);
      setStatus({ type: "success", msg: `Imported ${features.length} feature${features.length !== 1 ? "s" : ""}` });
      setText("");
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Import failed" });
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Import GeoJSON</span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 pt-3">
            Paste a GeoJSON FeatureCollection from{" "}
            <span className="font-medium">geojson.io</span> below.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder='{ "type": "FeatureCollection", "features": [...] }'
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {status && (
            <p
              className={`text-xs px-3 py-2 rounded ${
                status.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {status.msg}
            </p>
          )}
          <button
            onClick={handleImport}
            disabled={!text.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-md transition-colors"
          >
            Import Features
          </button>
        </div>
      )}
    </div>
  );
}
