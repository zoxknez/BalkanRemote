import { CalculatorImpl, CalculatorContext, CalculatorResult, CalculatorMeta } from '@/types/toolbox';
import { calculatorDefinitions } from '@/data/calculator-definitions';
import { logger } from './logger';

type RsNetGrossInput = {
  mode: 'NET_TO_GROSS' | 'GROSS_TO_NET';
  contractType: 'EMPLOYMENT' | 'B2B' | 'PAUSAL' | 'DOO';
  amount: number;
  year?: number;
  isResident?: boolean;
};

type EffectiveHourlyInput = {
  targetNetMonthly: number;
  billablePct: number;
  workHoursPerWeek: number;
  weeksPerYear: number;
  monthlyFixedCosts: number;
  bufferPct?: number;
};

type SalaryToDayRateInput = {
  annual: number;
  workingDays: number;
  hoursPerDay: number;
};

type ColNormalizerInput = {
  offerA: number;
  colIndexA: number;
  offerB: number;
  colIndexB: number;
};

type RemoteOfficeCostsInput = {
  internet: number;
  coworking: number;
  equipmentMonthly: number;
  power: number;
  other: number;
};

type TimeValue = number | string;

type TimezoneOverlapInput = {
  tzA: string;
  workStartA: TimeValue;
  workEndA: TimeValue;
  tzB: string;
  workStartB: TimeValue;
  workEndB: TimeValue;
};

type InvoiceBuilderInput = {
  items: number[];
  discountPct?: number;
  vatRate?: number;
  fx?: number;
};

type BreakEvenInput = {
  fixedMonthly: number;
  billableHoursPerMonth: number;
};

type RemoteReadinessInput = {
  internetScore: number;
  equipmentScore: number;
  environmentScore: number;
  habitsScore: number;
};

type CommuteSavingsInput = {
  oneWayMins: number;
  daysPerWeek: number;
  valuePerHour: number;
};

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

// Calculator Implementations
export const calculatorImplementations: Record<string, CalculatorImpl> = {
  rs_net_gross: {
    id: "rs_net_gross",
    compute: (rawInput, ctx) => {
      const { mode, contractType, amount, year = 2025 } = rawInput as RsNetGrossInput;
      const settings = typeof year === 'number' ? ctx?.settings?.RS?.[year] : undefined;
      
      let gross: number;
      let net: number;
      let tax = 0;
      let contributions = 0;
      let effectiveRate = 0;
      
      if (contractType === 'PAUSAL') {
        // Paušal - fiksni mesečni iznos ~26,500 RSD
        const pausalFee = settings?.pausal?.monthlyFee || 26500;
        if (mode === 'NET_TO_GROSS') {
          net = amount;
          gross = pausalFee;
          tax = pausalFee - amount;
        } else {
          gross = amount;
          net = amount - pausalFee + amount; // Zapravo kompleksnije
          tax = pausalFee;
        }
        effectiveRate = (tax / gross) * 100;
      } else if (contractType === 'B2B' || contractType === 'DOO') {
        // Preduzetnik - 10% porez + ~36% doprinosi na minimalac
        const taxRate = settings?.preduzetnik?.taxRate || 0.10;
        const contribRate = settings?.preduzetnik?.contribRate || 0.36;
        const minBase = settings?.minBase || 50000;
        
        if (mode === 'NET_TO_GROSS') {
          // Iterativno računanje jer su doprinosi na minimalac
          gross = amount / (1 - taxRate);
          tax = gross * taxRate;
          contributions = minBase * contribRate; // Na minimalac
          net = gross - tax - contributions;
        } else {
          gross = amount;
          tax = gross * taxRate;
          contributions = minBase * contribRate;
          net = gross - tax - contributions;
        }
        effectiveRate = ((tax + contributions) / gross) * 100;
      } else {
        // Employment - standardni doprinosi
        const taxRate = settings?.taxPct || 0.10;
        const contribEmployeeRate = settings?.contribEmployeePct || 0.19;
        
        if (mode === 'NET_TO_GROSS') {
          gross = amount / (1 - taxRate - contribEmployeeRate);
          tax = gross * taxRate;
          contributions = gross * contribEmployeeRate;
          net = gross - tax - contributions;
        } else {
          gross = amount;
          tax = gross * taxRate;
          contributions = gross * contribEmployeeRate;
          net = gross - tax - contributions;
        }
        effectiveRate = ((tax + contributions) / gross) * 100;
      }
      
      return {
        gross: Math.round(gross),
        net: Math.round(net),
        tax: Math.round(tax),
        contributions: Math.round(contributions),
        effectiveRate: Number(effectiveRate.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<RsNetGrossInput>;
      const errors: string[] = [];
      if (typeof input.amount !== 'number' || input.amount <= 0) {
        errors.push('Amount must be positive');
      }
      if (!input.mode || !['NET_TO_GROSS', 'GROSS_TO_NET'].includes(input.mode)) {
        errors.push('Invalid mode');
      }
      if (!input.contractType || !['EMPLOYMENT', 'B2B', 'PAUSAL', 'DOO'].includes(input.contractType)) {
        errors.push('Invalid contract type');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  effective_hourly_rate: {
    id: "effective_hourly_rate",
    compute: (rawInput) => {
      const {
        targetNetMonthly,
        billablePct,
        workHoursPerWeek,
        weeksPerYear,
        monthlyFixedCosts,
        bufferPct = 0,
      } = rawInput as EffectiveHourlyInput;
      
      const hoursYear = workHoursPerWeek * weeksPerYear;
      const billableHours = hoursYear * (billablePct / 100);
      const needed = (targetNetMonthly + monthlyFixedCosts) * 12 * (1 + bufferPct / 100);
      const suggestedHourly = needed / billableHours;
      const annualGross = targetNetMonthly * 12;
      
      return {
        suggestedHourly: Number(suggestedHourly.toFixed(2)),
        annualGross: Number(annualGross.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<EffectiveHourlyInput>;
      const errors: string[] = [];
      if (typeof input.billablePct !== 'number' || input.billablePct <= 0 || input.billablePct > 100) {
        errors.push('Billable percentage must be 1-100%');
      }
      if (typeof input.workHoursPerWeek !== 'number' || input.workHoursPerWeek <= 0) {
        errors.push('Work hours must be positive');
      }
      if (typeof input.weeksPerYear !== 'number' || input.weeksPerYear <= 0) {
        errors.push('Weeks per year must be positive');
      }
      if (typeof input.targetNetMonthly !== 'number' || input.targetNetMonthly < 0) {
        errors.push('Target net monthly must be zero or positive');
      }
      if (typeof input.monthlyFixedCosts !== 'number' || input.monthlyFixedCosts < 0) {
        errors.push('Monthly fixed costs must be zero or positive');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  salary_to_dayrate: {
    id: "salary_to_dayrate",
    compute: (rawInput) => {
      const { annual, workingDays, hoursPerDay } = rawInput as SalaryToDayRateInput;
      const dayRate = annual / workingDays;
      const hourly = dayRate / hoursPerDay;
      
      return {
        dayRate: Number(dayRate.toFixed(2)),
        hourly: Number(hourly.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<SalaryToDayRateInput>;
      const errors: string[] = [];
      if (typeof input.annual !== 'number' || input.annual <= 0) {
        errors.push('Annual salary must be positive');
      }
      if (typeof input.workingDays !== 'number' || input.workingDays <= 0) {
        errors.push('Working days must be positive');
      }
      if (typeof input.hoursPerDay !== 'number' || input.hoursPerDay <= 0) {
        errors.push('Hours per day must be positive');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  col_normalizer: {
    id: "col_normalizer",
    compute: (rawInput) => {
      const { offerA, colIndexA, offerB, colIndexB } = rawInput as ColNormalizerInput;
      const equivalentInB = offerA * (colIndexB / colIndexA);
      const deltaPct = (offerB / equivalentInB - 1) * 100;
      
      return {
        equivalentInB: Number(equivalentInB.toFixed(2)),
        deltaPct: Number(deltaPct.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<ColNormalizerInput>;
      const errors: string[] = [];
      if (typeof input.offerA !== 'number' || input.offerA <= 0) {
        errors.push('Offer A must be positive');
      }
      if (typeof input.offerB !== 'number' || input.offerB <= 0) {
        errors.push('Offer B must be positive');
      }
      if (typeof input.colIndexA !== 'number' || input.colIndexA <= 0) {
        errors.push('COL index A must be positive');
      }
      if (typeof input.colIndexB !== 'number' || input.colIndexB <= 0) {
        errors.push('COL index B must be positive');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  remote_office_costs: {
    id: "remote_office_costs",
    compute: (rawInput) => {
      const { internet, coworking, equipmentMonthly, power, other } = rawInput as RemoteOfficeCostsInput;
      const monthlyTotal = internet + coworking + equipmentMonthly + power + other;
      
      return {
        monthlyTotal: Number(monthlyTotal.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<RemoteOfficeCostsInput>;
      const errors: string[] = [];
      const fields: (keyof RemoteOfficeCostsInput)[] = ['internet', 'coworking', 'equipmentMonthly', 'power', 'other'];
      fields.forEach((field) => {
        const value = input[field];
        if (typeof value !== 'number' || value < 0) {
          errors.push(`${field} must be zero or positive`);
        }
      });
      return { valid: errors.length === 0, errors };
    }
  },

  timezone_overlap: {
    id: "timezone_overlap",
    compute: (rawInput) => {
      const { tzA, workStartA, workEndA, tzB, workStartB, workEndB } = rawInput as TimezoneOverlapInput;

      const parseTime = (value: TimeValue): number => {
        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }

        if (typeof value === "string") {
          const [hoursStr, minutesStr = "0"] = value.split(":");
          const hours = Number(hoursStr);
          const minutes = Number(minutesStr);
          if (Number.isFinite(hours) && Number.isFinite(minutes)) {
            return hours + minutes / 60;
          }
        }

        return NaN;
      };

      const getOffsetHours = (timeZone: string): number => {
        try {
          const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            timeZoneName: "shortOffset",
            hour: "2-digit",
          }).formatToParts(new Date());

          const tzPart = parts.find((part) => part.type === "timeZoneName");
          const match = tzPart?.value.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);

          if (!match) {
            return 0;
          }

          const hours = Number(match[1]);
          const minutes = match[2] ? Number(match[2]) : 0;

          if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
            return 0;
          }

          return hours + minutes / 60;
        } catch (error) {
          logger.warn('Failed to resolve timezone', timeZone, error);
          return 0;
        }
      };

      const normalizeRange = (start: number, end: number): [number, number] => {
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
          return [0, 0];
        }

        if (end <= start) {
          return [start, end + 24];
        }

        return [start, end];
      };

      const startA = parseTime(workStartA);
      const endA = parseTime(workEndA);
      const startB = parseTime(workStartB);
      const endB = parseTime(workEndB);

      const offsetA = getOffsetHours(tzA);
      const offsetB = getOffsetHours(tzB);

      const [utcStartA, utcEndA] = normalizeRange(startA - offsetA, endA - offsetA);
      const [utcStartB, utcEndB] = normalizeRange(startB - offsetB, endB - offsetB);

      const overlapStart = Math.max(utcStartA, utcStartB);
      const overlapEnd = Math.min(utcEndA, utcEndB);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      return {
        overlapHours: Number(overlap.toFixed(2))
      };
    }
  },

  invoice_builder_simple: {
    id: "invoice_builder_simple",
    compute: (rawInput) => {
      const { items, discountPct = 0, vatRate = 0, fx = 1 } = rawInput as InvoiceBuilderInput;

      const subtotal = isNumberArray(items)
        ? items.reduce((sum, item) => sum + item, 0) * (1 - discountPct / 100)
        : 0;
      const tax = subtotal * (vatRate / 100);
      const total = subtotal + tax;
      const totalRSD = total * fx;
      
      return {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        totalRSD: Number(totalRSD.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<InvoiceBuilderInput>;
      const errors: string[] = [];
      if (!Array.isArray(input.items) || !isNumberArray(input.items)) {
        errors.push('Items must be an array of numbers');
      }
      if (typeof input.discountPct === 'number' && input.discountPct < 0) {
        errors.push('Discount percentage cannot be negative');
      }
      if (typeof input.vatRate === 'number' && input.vatRate < 0) {
        errors.push('VAT rate cannot be negative');
      }
      if (typeof input.fx === 'number' && input.fx <= 0) {
        errors.push('Exchange rate must be positive');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  break_even_rate: {
    id: "break_even_rate",
    compute: (rawInput) => {
      const { fixedMonthly, billableHoursPerMonth } = rawInput as BreakEvenInput;
      const minHourly = fixedMonthly / billableHoursPerMonth;
      
      return {
        minHourly: Number(minHourly.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<BreakEvenInput>;
      const errors: string[] = [];
      if (typeof input.fixedMonthly !== 'number' || input.fixedMonthly < 0) {
        errors.push('Fixed monthly costs must be zero or positive');
      }
      if (typeof input.billableHoursPerMonth !== 'number' || input.billableHoursPerMonth <= 0) {
        errors.push('Billable hours per month must be positive');
      }
      return { valid: errors.length === 0, errors };
    }
  },

  remote_readiness_score: {
    id: "remote_readiness_score",
    compute: (rawInput) => {
      const { internetScore, equipmentScore, environmentScore, habitsScore } = rawInput as RemoteReadinessInput;
      
      // Weighted average
      const score = (internetScore * 0.3 + equipmentScore * 0.25 + environmentScore * 0.25 + habitsScore * 0.2);
      
      return {
        score: Number(score.toFixed(1))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<RemoteReadinessInput>;
      const errors: string[] = [];
      const fields: (keyof RemoteReadinessInput)[] = ['internetScore', 'equipmentScore', 'environmentScore', 'habitsScore'];
      fields.forEach((field) => {
        const value = input[field];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push(`${field} must be between 0 and 100`);
        }
      });
      return { valid: errors.length === 0, errors };
    }
  },

  commute_time_savings: {
    id: "commute_time_savings",
    compute: (rawInput) => {
      const { oneWayMins, daysPerWeek, valuePerHour } = rawInput as CommuteSavingsInput;
      const hoursSaved = (oneWayMins * 2 / 60) * daysPerWeek * 4.33; // ~4.33 weeks per month
      const valueSaved = hoursSaved * valuePerHour;
      
      return {
        hoursSaved: Number(hoursSaved.toFixed(1)),
        valueSaved: Number(valueSaved.toFixed(2))
      };
    },
    validate: (rawInput) => {
      const input = rawInput as Partial<CommuteSavingsInput>;
      const errors: string[] = [];
      if (typeof input.oneWayMins !== 'number' || input.oneWayMins < 0) {
        errors.push('One way minutes must be zero or positive');
      }
      if (typeof input.daysPerWeek !== 'number' || input.daysPerWeek < 0 || input.daysPerWeek > 7) {
        errors.push('Days per week must be between 0 and 7');
      }
      if (typeof input.valuePerHour !== 'number' || input.valuePerHour < 0) {
        errors.push('Value per hour must be zero or positive');
      }
      return { valid: errors.length === 0, errors };
    }
  }
};

// Calculator Engine
export class CalculatorEngine {
  private context: CalculatorContext;

  constructor(context: CalculatorContext = {}) {
    this.context = {
      settings: {
        RS: {
          2025: {
            taxPct: 0.10,
            contribEmployeePct: 0.19,
            contribEmployerPct: 0.17,
            minBase: 50000,
            maxBase: 1000000,
            pausal: {
              monthlyFee: 26500,
              maxAnnualIncome: 6000000
            },
            preduzetnik: {
              taxRate: 0.10,
              contribRate: 0.36
            },
            doo: {
              corporateTaxRate: 0.15,
              dividendTaxRate: 0.15
            }
          }
        }
      },
      rates: {
        fx: {
          'EUR_RSD': 117.5,
          'USD_RSD': 108.2
        }
      },
      year: 2025,
      ...context
    };
  }

  public runCalculator(id: string, input: Record<string, unknown>): CalculatorResult {
    const impl = calculatorImplementations[id];
    if (!impl) {
      throw new Error(`Calculator ${id} not found`);
    }

    // Validate input if validation function exists
    if (impl.validate) {
      const validation = impl.validate(input);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
      }
    }

    const outputs = impl.compute(input, this.context);
    const meta = calculatorDefinitions.find((def: CalculatorMeta) => def.id === id);

    return {
      id,
      inputs: input,
      outputs,
      timestamp: new Date().toISOString(),
      meta
    };
  }

  public getCalculatorMeta(id: string) {
    return calculatorDefinitions.find((def: CalculatorMeta) => def.id === id);
  }

  public getAllCalculators() {
    return calculatorDefinitions;
  }

  public getCalculatorsByCategory(categoryId: string) {
    return calculatorDefinitions.filter((calc: CalculatorMeta) => calc.category === categoryId);
  }

  public updateContext(newContext: Partial<CalculatorContext>) {
    this.context = { ...this.context, ...newContext };
  }
}
