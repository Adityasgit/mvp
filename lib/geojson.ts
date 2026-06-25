import type { CampusFeature, FeatureCategory, GeometryType } from "./types";

interface GeoJsonGeometry {
  type: string;
  coordinates: unknown;
}

interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties: Record<string, unknown> | null;
}

interface GeoJsonCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

function geometryTypeMap(geoType: string): GeometryType | null {
  if (geoType === "Point") return "point";
  if (geoType === "LineString" || geoType === "MultiLineString") return "line";
  if (geoType === "Polygon" || geoType === "MultiPolygon") return "polygon";
  return null;
}

function normalizeCoordinates(
  geoType: string,
  coords: unknown
): CampusFeature["coordinates"] | null {
  if (geoType === "Point") {
    const c = coords as number[];
    if (!Array.isArray(c) || c.length < 2) return null;
    return [c[0], c[1]];
  }
  if (geoType === "LineString") {
    const c = coords as number[][];
    if (!Array.isArray(c) || c.length < 2) return null;
    return c.map((p) => [p[0], p[1]] as [number, number]);
  }
  if (geoType === "Polygon") {
    const c = coords as number[][][];
    if (!Array.isArray(c) || c.length === 0) return null;
    return c.map((ring) => ring.map((p) => [p[0], p[1]] as [number, number]));
  }
  if (geoType === "MultiLineString") {
    const c = coords as number[][][];
    if (!Array.isArray(c) || c.length === 0) return null;
    return c[0].map((p) => [p[0], p[1]] as [number, number]);
  }
  if (geoType === "MultiPolygon") {
    const c = coords as number[][][][];
    if (!Array.isArray(c) || c.length === 0) return null;
    return c[0].map((ring) => ring.map((p) => [p[0], p[1]] as [number, number]));
  }
  return null;
}

function prop<T>(props: Record<string, unknown> | null, key: string, fallback: T): T {
  if (!props) return fallback;
  const v = props[key];
  if (v === undefined || v === null) return fallback;
  return v as T;
}

export function importGeoJson(raw: string): CampusFeature[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON");
  }

  const collection = parsed as GeoJsonCollection;
  if (!collection || collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new Error("Expected a GeoJSON FeatureCollection");
  }

  const results: CampusFeature[] = [];
  const now = new Date().toISOString();

  for (const f of collection.features) {
    if (!f.geometry) continue;
    const geoType = geometryTypeMap(f.geometry.type);
    if (!geoType) continue;
    const coordinates = normalizeCoordinates(f.geometry.type, f.geometry.coordinates);
    if (!coordinates) continue;

    const p = f.properties;
    results.push({
      id: crypto.randomUUID(),
      name: prop<string>(p, "name", "Unnamed Feature"),
      geometryType: geoType,
      coordinates,
      category: prop<FeatureCategory>(p, "category", "other"),
      description: prop<string>(p, "description", ""),
      floor: prop<number>(p, "floor", 0),
      blockCode: prop<string | null>(p, "blockCode", null),
      ar: {
        label: prop<string>(p, "name", "Feature"),
        showInAr: true,
        icon: geoType,
        priority: 3,
        displayDistance: true,
        displayDirection: true,
      },
      meta: {
        isActive: true,
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  return results;
}
