"use client";

import FeatureForm from "@/components/admin/FeatureForm";
import FeatureList from "@/components/admin/FeatureList";
import GeoJsonImporter from "@/components/admin/GeoJsonImporter";
import { loadData, saveData } from "@/lib/storage";
import type { CampusData, CampusFeature } from "@/lib/types";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState<CampusData | null>(null);
  const [editingFeature, setEditingFeature] = useState<CampusFeature | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  function persist(updated: CampusData) {
    saveData(updated);
    setData({ ...updated });
  }

  function handleSave(f: CampusFeature) {
    const exists = data!.features.findIndex((x) => x.id === f.id);
    const features =
      exists >= 0
        ? data!.features.map((x) => (x.id === f.id ? f : x))
        : [...data!.features, f];
    persist({ ...data!, features });
    setEditingFeature(null);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    persist({ ...data!, features: data!.features.filter((f) => f.id !== id) });
    if (selectedId === id) setSelectedId(null);
    if (editingFeature?.id === id) { setEditingFeature(null); setShowForm(false); }
  }

  function handleEdit(f: CampusFeature) {
    setEditingFeature(f);
    setShowForm(true);
  }

  function handleNewFeature() {
    setEditingFeature(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingFeature(null);
    setShowForm(false);
  }

  function handleImport(imported: CampusFeature[]) {
    const existingIds = new Set(data!.features.map((f) => f.id));
    const newFeatures = imported.filter((f) => !existingIds.has(f.id));
    persist({ ...data!, features: [...data!.features, ...newFeatures] });
  }

  function handleExport() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campus-navigator-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (!confirm("Reset all data? This cannot be undone.")) return;
    const empty: CampusData = { version: 1, updatedAt: new Date().toISOString(), features: [] };
    persist(empty);
    setEditingFeature(null);
    setShowForm(false);
    setSelectedId(null);
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col bg-white">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Features</span>
          <button
            onClick={handleNewFeature}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md transition-colors"
          >
            + Add
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <FeatureList
            features={data.features}
            selectedId={selectedId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={(f) => { setSelectedId(f.id); handleEdit(f); }}
          />
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <span className="text-sm text-gray-500">
            {data.features.length} feature{data.features.length !== 1 ? "s" : ""} stored
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="text-xs border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={handleReset}
              className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-2xl">
          {showForm ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <FeatureForm
                feature={editingFeature}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Select a feature to edit, or click <strong>+ Add</strong> to create one.</p>
            </div>
          )}

          <GeoJsonImporter onImport={handleImport} />
        </div>
      </div>
    </div>
  );
}
