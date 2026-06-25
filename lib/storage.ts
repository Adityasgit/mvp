import type { CampusData, CampusFeature, NavigatorSettings } from "./types";

const KEYS = {
  data: "campusNavigatorData",
  settings: "campusNavigatorSettings",
  lastTarget: "campusNavigatorLastTarget",
  drafts: "campusNavigatorDrafts",
} as const;

const SEED_FEATURES: CampusFeature[] = [
  {
    id: "seed_1",
    name: "Main Canteen",
    geometryType: "point",
    coordinates: [75.8577, 30.901],
    category: "canteen",
    description: "North campus canteen serving breakfast and lunch",
    floor: 0,
    blockCode: null,
    ar: {
      label: "Main Canteen",
      showInAr: true,
      icon: "canteen",
      priority: 1,
      displayDistance: true,
      displayDirection: true,
    },
    meta: {
      isActive: true,
      tags: ["food", "crowded"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "seed_2",
    name: "Main Gate",
    geometryType: "point",
    coordinates: [75.857, 30.9005],
    category: "gate",
    description: "Primary entrance to the campus",
    floor: 0,
    blockCode: null,
    ar: {
      label: "Main Gate",
      showInAr: true,
      icon: "gate",
      priority: 2,
      displayDistance: true,
      displayDirection: true,
    },
    meta: {
      isActive: true,
      tags: ["entrance"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "seed_3",
    name: "Walking Path A",
    geometryType: "line",
    coordinates: [
      [75.857, 30.9005],
      [75.8574, 30.9008],
      [75.8577, 30.901],
    ],
    category: "path",
    description: "Main walking path from gate to canteen",
    floor: 0,
    blockCode: null,
    ar: {
      label: "Path A",
      showInAr: true,
      icon: "path",
      priority: 3,
      displayDistance: false,
      displayDirection: true,
    },
    meta: {
      isActive: true,
      tags: ["walking"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "seed_4",
    name: "Academic Block A",
    geometryType: "polygon",
    coordinates: [
      [
        [75.8575, 30.9012],
        [75.8579, 30.9012],
        [75.8579, 30.9015],
        [75.8575, 30.9015],
        [75.8575, 30.9012],
      ],
    ],
    category: "building",
    description: "Main academic block with lecture halls",
    floor: 0,
    blockCode: "AB-A",
    ar: {
      label: "Block A",
      showInAr: true,
      icon: "building",
      priority: 2,
      displayDistance: true,
      displayDirection: true,
    },
    meta: {
      isActive: true,
      tags: ["academic"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

export function loadData(): CampusData {
  if (typeof window === "undefined") {
    return { version: 1, updatedAt: new Date().toISOString(), features: [] };
  }
  const raw = localStorage.getItem(KEYS.data);
  if (!raw) {
    const seed: CampusData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      features: SEED_FEATURES,
    };
    localStorage.setItem(KEYS.data, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as CampusData;
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), features: [] };
  }
}

export function saveData(data: CampusData): void {
  if (typeof window === "undefined") return;
  const updated = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEYS.data, JSON.stringify(updated));
}

const DEFAULT_SETTINGS: NavigatorSettings = {
  arEnabled: true,
  debugMode: false,
  maxRangeMeters: 200,
  fovDegrees: 90,
};

export function loadSettings(): NavigatorSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: NavigatorSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function loadLastTarget(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.lastTarget);
}

export function saveLastTarget(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(KEYS.lastTarget);
  } else {
    localStorage.setItem(KEYS.lastTarget, id);
  }
}

export function resetData(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
