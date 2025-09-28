export type NormalizedJob = {
  stableKey: string;
  sourceId: string;
  sourceName: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  // EUR normalized (optional)
  salaryMinEur?: number | null;
  salaryMaxEur?: number | null;
  postedAt: string; // ISO
  applyUrl: string;
  raw?: unknown; // stored for traceability
};
