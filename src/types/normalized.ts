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
  postedAt: string; // ISO
  applyUrl: string;
  raw?: unknown; // stored for traceability
};
