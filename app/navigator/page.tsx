"use client";

import ArOverlay from "@/components/navigator/ArOverlay";
import CameraView from "@/components/navigator/CameraView";
import CurrentLocation, { type LocationState } from "@/components/navigator/CurrentLocation";
import FeatureCard from "@/components/navigator/FeatureCard";
import MiniMap from "@/components/navigator/MiniMap";
import { bearing, featurePoint, formatDistance, haversineDistance, nearestFeatures } from "@/lib/geometry";
import { loadData, loadLastTarget, loadSettings, saveLastTarget, saveSettings } from "@/lib/storage";
import type { CampusData, CampusFeature, NavigatorSettings } from "@/lib/types";
import { useEffect, useState } from "react";

export default function NavigatorPage() {
  const [data, setData] = useState<CampusData | null>(null);
  const [settings, setSettings] = useState<NavigatorSettings | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setSettings(loadSettings());
    setSelectedId(loadLastTarget());
  }, []);

  // Device orientation for heading
  useEffect(() => {
    function handler(e: DeviceOrientationEvent) {
      if (e.alpha !== null) setDeviceHeading(e.alpha);
    }
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  function handleLocation(loc: LocationState) {
    setUserPos([loc.lng, loc.lat]);
    if (loc.heading !== null) setDeviceHeading(loc.heading);
  }

  function handleSelectFeature(f: CampusFeature) {
    setSelectedId(f.id);
    saveLastTarget(f.id);
  }

  function handleDeselect() {
    setSelectedId(null);
    saveLastTarget(null);
  }

  function toggleAr() {
    if (!settings) return;
    const updated = { ...settings, arEnabled: !settings.arEnabled };
    setSettings(updated);
    saveSettings(updated);
  }

  function toggleDebug() {
    if (!settings) return;
    const updated = { ...settings, debugMode: !settings.debugMode };
    setSettings(updated);
    saveSettings(updated);
  }

  if (!data || !settings) return null;

  const features = data.features;
  const selectedFeature = features.find((f) => f.id === selectedId) ?? null;

  const nearby = userPos
    ? nearestFeatures(userPos, features, settings.maxRangeMeters)
    : [];

  return (
    <div className="relative w-full h-[calc(100vh-56px)] bg-gray-900 overflow-hidden">
      <CameraView />

      <CurrentLocation
        onLocation={handleLocation}
        showBadge={true}
        debugMode={settings.debugMode}
      />

      {settings.arEnabled && (
        <ArOverlay
          userPos={userPos}
          deviceHeading={deviceHeading}
          features={features}
          selectedFeatureId={selectedId}
          onSelectFeature={handleSelectFeature}
          maxRangeMeters={settings.maxRangeMeters}
          fovDeg={settings.fovDegrees}
        />
      )}

      {selectedFeature && (
        <FeatureCard
          feature={selectedFeature}
          userPos={userPos}
          onDeselect={handleDeselect}
          mapVisible={showMap}
        />
      )}

      {/* Target picker overlay */}
      {showTargetPicker && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-end">
          <div className="w-full bg-white rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <p className="font-semibold text-gray-800">Select Target</p>
              <button onClick={() => setShowTargetPicker(false)} className="text-gray-400 text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {features.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No features stored. Add some in Admin.</p>
              ) : (
                features.map((f) => {
                  const pt = featurePoint(f);
                  const dist = userPos ? haversineDistance(userPos, pt) : null;
                  const bear = userPos ? bearing(userPos, pt) : null;
                  return (
                    <button
                      key={f.id}
                      onClick={() => { handleSelectFeature(f); setShowTargetPicker(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-100 text-left transition-colors ${
                        selectedId === f.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{f.category}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500 shrink-0">
                        {dist !== null && <p>{formatDistance(dist)}</p>}
                        {bear !== null && <p>{Math.round(bear)}°</p>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="pb-safe shrink-0" />
          </div>
        </div>
      )}

      {/* Mini map */}
      {showMap && (
        <div className="absolute bottom-28 right-3 z-20">
          <MiniMap
            userPos={userPos}
            features={features}
            deviceHeading={deviceHeading}
            selectedFeatureId={selectedId}
            expanded={mapExpanded}
            onToggleExpand={() => setMapExpanded((v) => !v)}
          />
        </div>
      )}

      {/* Debug panel */}
      {settings.debugMode && userPos && (
        <div className="absolute top-28 right-3 z-20 bg-black/70 text-white text-xs rounded-lg p-3 backdrop-blur-sm space-y-1 max-w-48">
          <p className="font-semibold text-gray-300">Debug</p>
          <p>Pos: {userPos[1].toFixed(5)}, {userPos[0].toFixed(5)}</p>
          <p>Heading: {Math.round(deviceHeading)}°</p>
          <p>Nearby: {nearby.length}</p>
          {selectedFeature && userPos && (
            <>
              <p className="font-semibold text-gray-300 mt-1">Target</p>
              <p>{selectedFeature.name}</p>
              <p>Dist: {formatDistance(haversineDistance(userPos, featurePoint(selectedFeature)))}</p>
              <p>Bear: {Math.round(bearing(userPos, featurePoint(selectedFeature)))}°</p>
            </>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-safe" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
        {/* Row 1 — primary actions */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={toggleAr}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm transition-colors ${
              settings.arEnabled
                ? "bg-blue-600 text-white"
                : "bg-white/20 text-white border border-white/30"
            }`}
          >
            {settings.arEnabled ? "AR On" : "AR Off"}
          </button>

          <button
            onClick={() => setShowTargetPicker(true)}
            className="flex-[2] py-3 rounded-xl text-sm font-semibold bg-white/20 text-white border border-white/30 shadow-lg backdrop-blur-sm active:bg-white/30 transition-colors min-w-0"
          >
            <span className="block truncate px-1">
              {selectedFeature ? `→ ${selectedFeature.name}` : "Set Target"}
            </span>
          </button>
        </div>

        {/* Row 2 — secondary toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm transition-colors ${
              showMap
                ? "bg-green-600 text-white"
                : "bg-white/20 text-white border border-white/30"
            }`}
          >
            Map
          </button>

          <button
            onClick={toggleDebug}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm transition-colors ${
              settings.debugMode
                ? "bg-yellow-500 text-gray-900"
                : "bg-white/20 text-white border border-white/30"
            }`}
          >
            Debug
          </button>
        </div>
      </div>
    </div>
  );
}
