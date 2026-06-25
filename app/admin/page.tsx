"use client";

import FeatureForm from "@/components/admin/FeatureForm";
import FeatureList from "@/components/admin/FeatureList";
import GeoJsonImporter from "@/components/admin/GeoJsonImporter";
import { loadData, saveData } from "@/lib/storage";
import type { CampusData, CampusFeature } from "@/lib/types";
import { useEffect, useState } from "react";

type MobileTab = "list" | "form";

export default function AdminPage() {
  const [data, setData] = useState<CampusData | null>(null);
  const [editingFeature, setEditingFeature] = useState<CampusFeature | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("list");

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
    setMobileTab("list");
  }

  function handleDelete(id: string) {
    persist({ ...data!, features: data!.features.filter((f) => f.id !== id) });
    if (selectedId === id) setSelectedId(null);
    if (editingFeature?.id === id) { setEditingFeature(null); setShowForm(false); }
  }

  function handleEdit(f: CampusFeature) {
    setEditingFeature(f);
    setShowForm(true);
    setMobileTab("form");
  }

  function handleNewFeature() {
    setEditingFeature(null);
    setShowForm(true);
    setMobileTab("form");
  }

  function handleCancel() {
    setEditingFeature(null);
    setShowForm(false);
    setMobileTab("list");
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
    setMobileTab("list");
  }

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
      <span className="text-sm text-gray-500">
        {data.features.length} feature{data.features.length !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="text-xs border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
        >
          Export
        </button>
        <button
          onClick={handleReset}
          className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  const formPanel = (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {toolbar}
      <div className="p-4 pb-8 space-y-4 max-w-2xl mx-auto">
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
            <p className="text-sm">
              Select a feature to edit, or tap <strong>+ Add</strong>.
            </p>
          </div>
        )}
        <GeoJsonImporter onImport={handleImport} />
      </div>
    </div>
  );

  const listPanel = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 shrink-0">
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
  );

  return (
    <>
      {/* ── Desktop: side-by-side ── */}
      <div className="hidden md:flex h-[calc(100vh-56px)]">
        <div className="w-72 shrink-0 flex flex-col overflow-hidden">
          {listPanel}
        </div>
        {formPanel}
      </div>

      {/* ── Mobile: tabbed ── */}
      <div className="flex flex-col md:hidden h-[calc(100vh-56px)]">
        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mobileTab === "list" ? listPanel : formPanel}
        </div>

        {/* Bottom tab bar */}
        <div className="shrink-0 flex border-t border-gray-200 bg-white safe-area-bottom">
          <button
            onClick={() => setMobileTab("list")}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              mobileTab === "list"
                ? "text-blue-600 border-t-2 border-blue-600 -mt-px"
                : "text-gray-500"
            }`}
          >
            <span className="text-base leading-none mb-0.5">📋</span>
            Features
          </button>
          <button
            onClick={() => setMobileTab("form")}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              mobileTab === "form"
                ? "text-blue-600 border-t-2 border-blue-600 -mt-px"
                : "text-gray-500"
            }`}
          >
            <span className="text-base leading-none mb-0.5">✏️</span>
            {showForm ? (editingFeature ? "Edit" : "Add") : "Form"}
          </button>
        </div>
      </div>
    </>
  );
}
