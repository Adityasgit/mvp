export type GeometryType = "point" | "line" | "polygon";

export type FeatureCategory =
  | "canteen"
  | "gate"
  | "entrance"
  | "road"
  | "path"
  | "building"
  | "hostel"
  | "library"
  | "parking"
  | "other";

export interface ArConfig {
  label: string;
  showInAr: boolean;
  icon: string;
  priority: number;
  displayDistance: boolean;
  displayDirection: boolean;
  targetRadius?: number;
  highlightColor?: string;
}

export interface FeatureMeta {
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampusFeature {
  id: string;
  name: string;
  geometryType: GeometryType;
  // point: [lng, lat]  |  line: [[lng,lat],...]  |  polygon: [[[lng,lat],...]]
  coordinates: [number, number] | [number, number][] | [number, number][][];
  category: FeatureCategory;
  description: string;
  floor: number;
  blockCode: string | null;
  ar: ArConfig;
  meta: FeatureMeta;
}

export interface CampusData {
  version: number;
  updatedAt: string;
  features: CampusFeature[];
}

export interface NavigatorSettings {
  arEnabled: boolean;
  debugMode: boolean;
  maxRangeMeters: number;
  fovDegrees: number;
}
