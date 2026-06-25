"use client";

import type { CampusFeature, GeometryType } from "@/lib/types";
import { useState } from "react";

interface Props {
  features: CampusFeature[];
  selectedId: string | null;
  onEdit: (f: CampusFeature) => void;
  onDelete: (id: string) => void;
  onSelect: (f: CampusFeature) => void;
}

const TYPE_COLORS: Record<GeometryType, string> = {
  point: "bg-blue-100 text-blue-800",
  line: "bg-green-100 text-green-800",
  polygon: "bg-purple-100 text-purple-800",
};

const ALL_TYPES: Array<GeometryType | "all"> = ["all", "point", "line", "polygon"];

export default function FeatureList({ features, selectedId, onEdit, onDelete, onSelect }: Props) {
  const [filter, setFilter] = useState<GeometryType | "all">("all");
  const [search, setSearch] = useState("");

  const visible = features.filter((f) => {
    if (filter !== "all" && f.geometryType !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 space-y-2">
        <input
          type="text"
          placeholder="Search features…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                filter === t
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">No features found</p>
        ) : (
          visible.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelect(f)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === f.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-500 truncate">{f.category}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[f.geometryType]}`}>
                  {f.geometryType}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(f); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${f.name}"?`)) onDelete(f.id);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-gray-200 text-xs text-gray-400 text-center">
        {visible.length} of {features.length} features
      </div>
    </div>
  );
}
