export interface DropOffPoint {
  id: string;
  name: string;
  address: string;
  accepted_materials: string[];
  latitude: number | null;
  longitude: number | null;
  created_by: string | null;
  created_at: string;
}

export interface NewDropOffPoint {
  name: string;
  address: string;
  accepted_materials: string[];
  latitude?: number | null;
  longitude?: number | null;
}

export interface Level {
  level: number;
  title: string;
  min_reports: number;
}

export interface LevelProgress {
  current: Level;
  next: Level | null;
  reportsCount: number;
  reportsToNext: number;
  progress: number; // 0..1
}

export interface LevelWithProgress {
  level: number;
  title: string;
  min_reports: number;
  is_unlocked: boolean;
  is_current: boolean;
  reports_needed: number;
}