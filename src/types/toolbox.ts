// Remote Balkan Toolbox Types
export interface ToolboxLink {
  id: string;
  category: string;
  name: string;
  type: string;
  use: string;
  url: string;
  tags?: string[];
  rating?: number;
  isFeatured?: boolean;
  isLocal?: boolean; // For Balkan-specific services
}

export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  status: 'mvp' | 'planned' | 'idea';
  category: string;
  priority: number;
  dependencies?: string[];
  technicalNotes?: string;
  isLocal?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  languages: string[];
  preferredSalary: {
    min: number;
    max: number;
    currency: string;
  };
  timezone: string;
  location: string;
  workType: 'full-time' | 'contract' | 'freelance' | 'both';
}

export interface SmartMatchResult {
  jobId: string;
  score: number;
  reasons: string[];
  salaryMatch: boolean;
  skillsMatch: number; // percentage
  locationMatch: boolean;
}

export interface SalaryData {
  role: string;
  company?: string;
  location: string;
  currency: string;
  amount: number;
  experienceLevel: string;
  source: string;
  verifiedAt?: Date;
}

export interface CostOfLiving {
  city: string;
  country: string;
  currency: string;
  rentOneRoom: number;
  utilities: number;
  food: number;
  transport: number;
  total: number;
  source: string;
}

export interface TaxInfo {
  country: string;
  type: 'pausal' | 'doo' | 'freelance' | 'employee';
  rate: number;
  description: string;
  benefits: string[];
  requirements: string[];
  officialLink: string;
}

export interface CoworkingSpace {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  pricePerDay: number;
  pricePerMonth: number;
  currency: string;
  amenities: string[];
  internetSpeed: number;
  quietRooms: boolean;
  rating: number;
  website: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ISPProvider {
  name: string;
  type: 'fiber' | 'cable' | 'mobile' | 'satellite';
  city: string;
  speedMbps: number;
  pricePerMonth: number;
  currency: string;
  reliability: number; // 1-5 rating
  coverage: string[];
  website: string;
}

export interface NotificationPreference {
  userId: string;
  email: boolean;
  telegram: boolean;
  frequency: 'daily' | 'weekly' | 'instant';
  categories: string[];
  salaryThreshold?: number;
}

// Advanced Multi-Functional Calculator System
export type CalculatorFieldType = 
  | "number" 
  | "string" 
  | "boolean" 
  | "enum" 
  | "array:number" 
  | "array" 
  | "date"
  | "map";

export interface CalculatorField {
  name: string;
  type: CalculatorFieldType;
  unit?: string;
  example?: string | number;
  values?: string[]; // for enum
  description?: string;
  default?: unknown;
  schema?: Record<string, unknown>; // for complex types
  "0to100"?: boolean;
}

export interface CalculatorMeta {
  id: string;
  name: string;
  description: string;
  inputs: CalculatorField[];
  outputs: CalculatorField[];
  formula: string;
  tags: string[];
  country_support: string[];
  notes?: string;
  category?: string;
  version?: string;
  generated_at?: string;
}

export interface CalculatorImpl {
  id: string;
  compute: (input: Record<string, unknown>, ctx?: CalculatorContext) => Record<string, unknown>;
  validate?: (input: Record<string, unknown>) => { valid: boolean; errors?: string[] };
}

export interface CalculatorContext {
  settings?: {
    [countryCode: string]: {
      [year: number]: TaxSettings;
    };
  };
  rates?: {
    perDiem?: Record<string, number>;
    mileage?: Record<string, number>;
    fx?: Record<string, number>;
  };
  year?: number;
  user?: UserProfile;
}

export interface TaxSettings {
  // Serbia specific
  contribEmployerPct?: number;
  contribEmployeePct?: number;
  taxPct?: number;
  minBase?: number;
  maxBase?: number;
  pausal?: {
    monthlyFee: number;
    maxAnnualIncome: number;
  };
  preduzetnik?: {
    taxRate: number;
    contribRate: number;
  };
  doo?: {
    corporateTaxRate: number;
    dividendTaxRate: number;
  };
  // Generic for other countries
  [key: string]: unknown;
}

export interface CalculatorResult {
  id: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  timestamp: string;
  meta?: CalculatorMeta;
}

export interface CalculatorCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  calculators: string[];
}
