"use client";

import type { CampusFeature, FeatureCategory, GeometryType } from "@/lib/types";
import { useState, useEffect } from "react";

interface Props {
  feature: CampusFeature | null;
  onSave: (f: CampusFeature) => void;
  onCancel: () => void;
}

const CATEGORIES: FeatureCategory[] = [
  "canteen", "gate", "entrance", "road", "path",
  "building", "hostel", "library", "parking", "other",
];

const GEO_TYPES: GeometryType[] = ["point", "line", "polygon"];

const EMPTY: Omit<CampusFeature, "id" | "meta"> = {
  name: "",
  geometryType: "point",
  coordinates: [0, 0],
  category: "other",
  description: "",
  floor: 0,
  blockCode: null,
  ar: {
    label: "",
    showInAr: true,
    icon: "",
    priority: 3,
    displayDistance: true,
    displayDirection: true,
  },
};

function coordsToText(f: CampusFeature | null): string {
  if (!f) return "";
  return JSON.stringify(f.coordinates, null, 2);
}

export default function FeatureForm({ feature, onSave, onCancel }: Props) {
  const [name, setName] = useState(feature?.name ?? "");
  const [geometryType, setGeometryType] = useState<GeometryType>(feature?.geometryType ?? "point");
  const [coordsText, setCoordsText] = useState(coordsToText(feature));
  const [category, setCategory] = useState<FeatureCategory>(feature?.category ?? "other");
  const [description, setDescription] = useState(feature?.description ?? "");
  const [floor, setFloor] = useState(feature?.floor ?? 0);
  const [blockCode, setBlockCode] = useState(feature?.blockCode ?? "");
  const [arLabel, setArLabel] = useState(feature?.ar.label ?? "");
  const [showInAr, setShowInAr] = useState(feature?.ar.showInAr ?? true);
  const [arIcon, setArIcon] = useState(feature?.ar.icon ?? "");
  const [priority, setPriority] = useState(feature?.ar.priority ?? 3);
  const [displayDistance, setDisplayDistance] = useState(feature?.ar.displayDistance ?? true);
  const [displayDirection, setDisplayDirection] = useState(feature?.ar.displayDirection ?? true);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(feature?.name ?? "");
    setGeometryType(feature?.geometryType ?? "point");
    setCoordsText(coordsToText(feature));
    setCategory(feature?.category ?? "other");
    setDescription(feature?.description ?? "");
    setFloor(feature?.floor ?? 0);
    setBlockCode(feature?.blockCode ?? "");
    setArLabel(feature?.ar.label ?? "");
    setShowInAr(feature?.ar.showInAr ?? true);
    setArIcon(feature?.ar.icon ?? "");
    setPriority(feature?.ar.priority ?? 3);
    setDisplayDistance(feature?.ar.displayDistance ?? true);
    setDisplayDirection(feature?.ar.displayDirection ?? true);
    setError("");
  }, [feature]);

  function validate(): CampusFeature | null {
    if (!name.trim()) { setError("Name is required"); return null; }
    let coordinates: CampusFeature["coordinates"];
    try {
      coordinates = JSON.parse(coordsText);
    } catch {
      setError("Coordinates must be valid JSON");
      return null;
    }
    if (!Array.isArray(coordinates)) { setError("Coordinates must be an array"); return null; }
    if (geometryType === "point") {
      const c = coordinates as number[];
      if (c.length < 2 || typeof c[0] !== "number" || typeof c[1] !== "number") {
        setError("Point must be [lng, lat]");
        return null;
      }
    }
    if (geometryType === "line" && (coordinates as unknown[]).length < 2) {
      setError("Line needs at least 2 coordinates");
      return null;
    }
    const now = new Date().toISOString();
    return {
      id: feature?.id ?? crypto.randomUUID(),
      name: name.trim(),
      geometryType,
      coordinates,
      category,
      description: description.trim(),
      floor,
      blockCode: blockCode.trim() || null,
      ar: {
        label: arLabel.trim() || name.trim(),
        showInAr,
        icon: arIcon.trim() || geometryType,
        priority,
        displayDistance,
        displayDirection,
      },
      meta: {
        isActive: true,
        tags: feature?.meta.tags ?? [],
        createdAt: feature?.meta.createdAt ?? now,
        updatedAt: now,
      },
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validate();
    if (result) onSave(result);
  }

  const isEdit = !!feature;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800">
        {isEdit ? "Edit Feature" : "Add Feature"}
      </h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Geometry Type</label>
          <select
            value={geometryType}
            onChange={(e) => setGeometryType(e.target.value as GeometryType)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GEO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeatureCategory)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Coordinates (JSON)
            <span className="ml-1 text-gray-400 font-normal">
              {geometryType === "point" ? "[lng, lat]" : geometryType === "line" ? "[[lng,lat],...]" : "[[[lng,lat],...]]"}
            </span>
          </label>
          <textarea
            value={coordsText}
            onChange={(e) => setCoordsText(e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Floor</label>
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Block Code</label>
          <input
            value={blockCode}
            onChange={(e) => setBlockCode(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AR Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">AR Label</label>
            <input
              value={arLabel}
              onChange={(e) => setArLabel(e.target.value)}
              placeholder={name || "label"}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
            <input
              value={arIcon}
              onChange={(e) => setArIcon(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priority (1=high)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showInAr} onChange={(e) => setShowInAr(e.target.checked)} className="accent-blue-600" />
              Show in AR
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={displayDistance} onChange={(e) => setDisplayDistance(e.target.checked)} className="accent-blue-600" />
              Show distance
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={displayDirection} onChange={(e) => setDisplayDirection(e.target.checked)} className="accent-blue-600" />
              Show direction
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition-colors"
        >
          {isEdit ? "Save Changes" : "Add Feature"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
