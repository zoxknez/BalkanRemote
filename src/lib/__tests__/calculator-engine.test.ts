import { beforeEach, describe, expect, it } from 'vitest';
import { CalculatorEngine } from '../calculator-engine';

describe('CalculatorEngine', () => {
  let engine: CalculatorEngine;

  beforeEach(() => {
    engine = new CalculatorEngine();
  });

  it('computes Serbian net/gross conversion for paušal contracts', () => {
    const result = engine.runCalculator('rs_net_gross', {
      mode: 'GROSS_TO_NET',
      contractType: 'PAUSAL',
      amount: 100_000,
      year: 2025,
      isResident: true,
    });

    expect(result.outputs).toMatchObject({
      gross: 100_000,
      tax: expect.any(Number),
      contributions: expect.any(Number),
      effectiveRate: expect.any(Number),
    });
    expect(result.outputs.net).toBeGreaterThan(result.outputs.gross as number);
  });

  it('supports net-to-gross conversions for B2B', () => {
    const result = engine.runCalculator('rs_net_gross', {
      mode: 'NET_TO_GROSS',
      contractType: 'B2B',
      amount: 80_000,
      year: 2025,
      isResident: true,
    });

    expect(result.outputs).toMatchObject({
      gross: expect.any(Number),
      net: expect.any(Number),
      effectiveRate: expect.any(Number),
    });
    expect(result.outputs.gross).toBeGreaterThan(result.outputs.net as number);
  });

  it('rejects calculators that are not registered', () => {
    expect(() => engine.runCalculator('non_existent', {})).toThrowError(
      /Calculator non_existent not found/
    );
  });

  it('performs effective hourly rate estimation', () => {
    const { outputs } = engine.runCalculator('effective_hourly_rate', {
      targetNetMonthly: 3_000,
      billablePct: 60,
      workHoursPerWeek: 40,
      weeksPerYear: 48,
      monthlyFixedCosts: 500,
      bufferPct: 15,
    });

    expect(outputs).toMatchObject({
      suggestedHourly: expect.any(Number),
      annualGross: 36_000,
    });
    expect(outputs.suggestedHourly as number).toBeGreaterThan(0);
  });

  it('calculates day rate from annual salary', () => {
    const { outputs } = engine.runCalculator('salary_to_dayrate', {
      annual: 50_000,
      workingDays: 220,
      hoursPerDay: 8,
    });

    expect(outputs).toEqual({
      dayRate: Number((50_000 / 220).toFixed(2)),
      hourly: Number(((50_000 / 220) / 8).toFixed(2)),
    });
  });

  it('rejects day rate calculation when working days equal zero', () => {
    expect(() =>
      engine.runCalculator('salary_to_dayrate', {
        annual: 50_000,
        workingDays: 0,
        hoursPerDay: 8,
      })
    ).toThrowError(/Working days must be positive/);
  });

  it('normalizes cost of living differences', () => {
    const { outputs } = engine.runCalculator('col_normalizer', {
      offerA: 60_000,
      colIndexA: 100,
      offerB: 45_000,
      colIndexB: 70,
    });

    expect(outputs).toMatchObject({
      equivalentInB: expect.any(Number),
      deltaPct: expect.any(Number),
    });
  });

  it('rejects cost of living normalization with invalid indices', () => {
    expect(() =>
      engine.runCalculator('col_normalizer', {
        offerA: 60_000,
        colIndexA: 0,
        offerB: 45_000,
        colIndexB: 70,
      })
    ).toThrowError(/COL index A must be positive/);
  });

  it('estimates timezone overlap using real offsets', () => {
    const { outputs } = engine.runCalculator('timezone_overlap', {
      tzA: 'Europe/Belgrade',
      workStartA: '09:00',
      workEndA: '17:00',
      tzB: 'America/New_York',
      workStartB: '09:00',
      workEndB: '17:00',
    });

    expect(outputs).toMatchObject({ overlapHours: expect.any(Number) });
    const overlap = outputs.overlapHours as number;
    expect(overlap).toBeGreaterThanOrEqual(0);
    expect(overlap).toBeLessThanOrEqual(8);

    // Central Europe (UTC+1/UTC+2) vs Eastern (UTC-5/UTC-4) should overlap ~2h for identical 9-17 days
    expect(overlap).toBeGreaterThan(1);
    expect(overlap).toBeLessThanOrEqual(3);
  });

  it('handles shifts without overlap gracefully', () => {
    const { outputs } = engine.runCalculator('timezone_overlap', {
      tzA: 'Europe/Belgrade',
      workStartA: '09:00',
      workEndA: '12:00',
      tzB: 'America/Los_Angeles',
      workStartB: '15:00',
      workEndB: '23:00',
    });

    expect(outputs).toEqual({ overlapHours: 0 });
  });

  it('evaluates remote office costs and enforces non-negative inputs', () => {
    const { outputs } = engine.runCalculator('remote_office_costs', {
      internet: 25,
      coworking: 150,
      equipmentMonthly: 80,
      power: 20,
      other: 15,
    });

    expect(outputs).toEqual({ monthlyTotal: 290 });

    expect(() =>
      engine.runCalculator('remote_office_costs', {
        internet: -1,
        coworking: 0,
        equipmentMonthly: 0,
        power: 0,
        other: 0,
      })
    ).toThrowError(/internet must be zero or positive/);
  });

  it('builds invoices with tax and discount calculations', () => {
    const { outputs } = engine.runCalculator('invoice_builder_simple', {
      items: [100, 200],
      discountPct: 10,
      vatRate: 20,
      fx: 117,
    });

    expect(outputs).toEqual({
      subtotal: 270,
      tax: 54,
      total: 324,
      totalRSD: 37908,
    });

    expect(() =>
      engine.runCalculator('invoice_builder_simple', {
        items: ['invalid' as unknown as number],
      })
    ).toThrowError(/Items must be an array of numbers/);
  });

  it('guards break-even calculator against zero billable hours', () => {
    expect(() =>
      engine.runCalculator('break_even_rate', {
        fixedMonthly: 1_000,
        billableHoursPerMonth: 0,
      })
    ).toThrowError(/Billable hours per month must be positive/);
  });

  it('computes remote readiness scores and enforces bounds', () => {
    const { outputs } = engine.runCalculator('remote_readiness_score', {
      internetScore: 80,
      equipmentScore: 90,
      environmentScore: 70,
      habitsScore: 60,
    });

    const readiness = outputs as { score: number };
    expect(readiness).toEqual({ score: 76.0 });

    expect(() =>
      engine.runCalculator('remote_readiness_score', {
        internetScore: 120,
        equipmentScore: 90,
        environmentScore: 70,
        habitsScore: 60,
      })
    ).toThrowError(/internetScore must be between 0 and 100/);
  });

  it('calculates commute savings and rejects invalid day counts', () => {
    const { outputs } = engine.runCalculator('commute_time_savings', {
      oneWayMins: 30,
      daysPerWeek: 5,
      valuePerHour: 25,
    });

    const { hoursSaved, valueSaved } = outputs as { hoursSaved: number; valueSaved: number };
  expect(hoursSaved).toBe(21.6);
  expect(valueSaved).toBe(541.25);

    expect(() =>
      engine.runCalculator('commute_time_savings', {
        oneWayMins: 30,
        daysPerWeek: 9,
        valuePerHour: 25,
      })
    ).toThrowError(/Days per week must be between 0 and 7/);
  });

  it('exposes calculator metadata helpers', () => {
    const meta = engine.getCalculatorMeta('rs_net_gross');
    expect(meta?.id).toBe('rs_net_gross');

    const all = engine.getAllCalculators();
    expect(all.length).toBeGreaterThan(0);

    const salaryCalculators = engine.getCalculatorsByCategory('salary-tax');
    expect(salaryCalculators.every((calc) => calc.category === 'salary-tax')).toBe(true);
  });
});
