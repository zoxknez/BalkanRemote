import { CalculatorMeta } from '@/types/toolbox';

// Definicije kalkulatora na osnovu JSON specifikacije
export const calculatorDefinitions: CalculatorMeta[] = [
  {
    id: "rs_net_gross",
    name: "RS Net↔Gross Plata (B2B/PP/DOO)",
    description: "Proračun neto↔bruto plate za Srbiju sa parametrima doprinosa, poreza, minimalne/osnovice i tipa angažmana (B2B/preduzetnik paušal/DOO).",
    category: "salary-tax",
    inputs: [
      {
        name: "mode",
        type: "enum",
        values: ["NET_TO_GROSS", "GROSS_TO_NET"]
      },
      {
        name: "contractType",
        type: "enum",
        values: ["EMPLOYMENT", "B2B", "PAUSAL", "DOO"]
      },
      {
        name: "amount",
        type: "number",
        unit: "RSD"
      },
      {
        name: "location",
        type: "string",
        example: "Serbia"
      },
      {
        name: "isResident",
        type: "boolean"
      },
      {
        name: "year",
        type: "number",
        example: 2025
      }
    ],
    outputs: [
      {
        name: "gross",
        type: "number",
        unit: "RSD"
      },
      {
        name: "net",
        type: "number",
        unit: "RSD"
      },
      {
        name: "tax",
        type: "number",
        unit: "RSD"
      },
      {
        name: "contributions",
        type: "number",
        unit: "RSD"
      },
      {
        name: "effectiveRate",
        type: "number",
        unit: "%"
      }
    ],
    formula: "Parametrizovana: net = gross - (tax + contributions). Stope i osnovice eksterno iz settingsRef.",
    tags: ["salary", "tax", "serbia"],
    country_support: ["RS"],
    notes: "Bez hardkodovanja stopa; sve iz konfiguracije."
  },
  {
    id: "effective_hourly_rate",
    name: "Efektivna satnica (freelance)",
    description: "Izračun realne satnice posle ne‑fakturisivog vremena, odmora, praznika i troškova.",
    category: "freelance-rates",
    inputs: [
      {
        name: "targetNetMonthly",
        type: "number",
        unit: "EUR"
      },
      {
        name: "billablePct",
        type: "number",
        unit: "%",
        example: 60
      },
      {
        name: "workHoursPerWeek",
        type: "number",
        example: 40
      },
      {
        name: "weeksPerYear",
        type: "number",
        example: 48
      },
      {
        name: "monthlyFixedCosts",
        type: "number",
        unit: "EUR",
        example: 300
      },
      {
        name: "bufferPct",
        type: "number",
        unit: "%",
        example: 10
      }
    ],
    outputs: [
      {
        name: "suggestedHourly",
        type: "number",
        unit: "EUR/h"
      },
      {
        name: "annualGross",
        type: "number",
        unit: "EUR"
      }
    ],
    formula: "hours_year = workHoursPerWeek * weeksPerYear; billable_hours = hours_year * billablePct; needed = (targetNetMonthly+monthlyFixedCosts)*(12)*(1+bufferPct); suggestedHourly = needed/billable_hours.",
    tags: ["rates", "freelance"],
    country_support: ["ALL"]
  },
  {
    id: "salary_to_dayrate",
    name: "Godišnja plata → dnevna/satnica",
    description: "Pretvori ponudjenu godišnju bruto/neto u day-rate i hourly uz pretpostavljeni broj radnih dana.",
    category: "freelance-rates",
    inputs: [
      {
        name: "annual",
        type: "number",
        unit: "EUR"
      },
      {
        name: "workingDays",
        type: "number",
        example: 220
      },
      {
        name: "hoursPerDay",
        type: "number",
        example: 8
      }
    ],
    outputs: [
      {
        name: "dayRate",
        type: "number",
        unit: "EUR/day"
      },
      {
        name: "hourly",
        type: "number",
        unit: "EUR/h"
      }
    ],
    formula: "dayRate = annual/workingDays; hourly = dayRate/hoursPerDay.",
    tags: ["rates"],
    country_support: ["ALL"]
  },
  {
    id: "col_normalizer",
    name: "Cost-of-Living normalizer",
    description: "Uporedi ponudu između dva grada preko indeksa troškova života (input).",
    category: "cost-of-living",
    inputs: [
      {
        name: "offerA",
        type: "number",
        unit: "EUR"
      },
      {
        name: "colIndexA",
        type: "number",
        unit: "index"
      },
      {
        name: "offerB",
        type: "number",
        unit: "EUR"
      },
      {
        name: "colIndexB",
        type: "number",
        unit: "index"
      }
    ],
    outputs: [
      {
        name: "equivalentInB",
        type: "number",
        unit: "EUR"
      },
      {
        name: "deltaPct",
        type: "number",
        unit: "%"
      }
    ],
    formula: "equivalentInB = offerA*(colIndexB/colIndexA); deltaPct = (offerB/equivalentInB - 1)*100.",
    tags: ["cost-of-living", "salary"],
    country_support: ["ALL"],
    notes: "colIndex preuzeti iz externe tabele."
  },
  {
    id: "remote_office_costs",
    name: "Troškovnik remote kancelarije",
    description: "Mesečni trošak (internet+coworking+oprema amortizacija+stradanje UPS).",
    category: "cost-of-living",
    inputs: [
      {
        name: "internet",
        type: "number",
        unit: "EUR"
      },
      {
        name: "coworking",
        type: "number",
        unit: "EUR"
      },
      {
        name: "equipmentMonthly",
        type: "number",
        unit: "EUR"
      },
      {
        name: "power",
        type: "number",
        unit: "EUR"
      },
      {
        name: "other",
        type: "number",
        unit: "EUR"
      }
    ],
    outputs: [
      {
        name: "monthlyTotal",
        type: "number",
        unit: "EUR"
      }
    ],
    formula: "Zbir parametara.",
    tags: ["budget"],
    country_support: ["ALL"]
  },
  {
    id: "timezone_overlap",
    name: "Overlap radnih sati (TZ)",
    description: "Koliko sati se preklapa između dva tima (npr. CET i PST) za zadate radne prozore.",
    category: "time-scheduling",
    inputs: [
      {
        name: "tzA",
        type: "string",
        example: "Europe/Belgrade"
      },
      {
        name: "workStartA",
        type: "string",
        example: "09:00"
      },
      {
        name: "workEndA",
        type: "string",
        example: "17:00"
      },
      {
        name: "tzB",
        type: "string",
        example: "America/Los_Angeles"
      },
      {
        name: "workStartB",
        type: "string",
        example: "09:00"
      },
      {
        name: "workEndB",
        type: "string",
        example: "17:00"
      }
    ],
    outputs: [
      {
        name: "overlapHours",
        type: "number"
      }
    ],
    formula: "Pretvori u UTC intervale, presek dužina.",
    tags: ["timezone", "scheduling"],
    country_support: ["ALL"]
  },
  {
    id: "invoice_builder_simple",
    name: "Brzi obračun fakture",
    description: "Suma stavki, popust, PDV stopa (param), konverzija valute.",
    category: "freelance-rates",
    inputs: [
      {
        name: "items",
        type: "array:number",
        description: "Lista (qty*price) suma pre PDV"
      },
      {
        name: "discountPct",
        type: "number",
        unit: "%",
        example: 0
      },
      {
        name: "vatRate",
        type: "number",
        unit: "%",
        example: 0
      },
      {
        name: "fx",
        type: "number",
        unit: "rate",
        description: "Kurs EUR→RSD npr."
      }
    ],
    outputs: [
      {
        name: "subtotal",
        type: "number"
      },
      {
        name: "tax",
        type: "number"
      },
      {
        name: "total",
        type: "number"
      },
      {
        name: "totalRSD",
        type: "number"
      }
    ],
    formula: "subtotal = sum(items)*(1-discountPct); tax=subtotal*vatRate; total=subtotal+tax; totalRSD=total*fx.",
    tags: ["invoice"],
    country_support: ["ALL"],
    notes: "VAT stopu dati kao parametar."
  },
  {
    id: "break_even_rate",
    name: "Break-even satnica",
    description: "Satnica da pokriješ sve fiksne troškove",
    category: "freelance-rates",
    inputs: [
      {
        name: "fixedMonthly",
        type: "number"
      },
      {
        name: "billableHoursPerMonth",
        type: "number"
      }
    ],
    outputs: [
      {
        name: "minHourly",
        type: "number"
      }
    ],
    formula: "minHourly = fixedMonthly/billableHoursPerMonth.",
    tags: ["rates"],
    country_support: ["ALL"]
  },
  {
    id: "remote_readiness_score",
    name: "Remote readiness skor",
    description: "Skor spremnosti za remote (internet, oprema, prostor, disciplina).",
    category: "assessments",
    inputs: [
      {
        name: "internetScore",
        type: "number",
        "0to100": true
      },
      {
        name: "equipmentScore",
        type: "number",
        "0to100": true
      },
      {
        name: "environmentScore",
        type: "number",
        "0to100": true
      },
      {
        name: "habitsScore",
        type: "number",
        "0to100": true
      }
    ],
    outputs: [
      {
        name: "score",
        type: "number",
        "0to100": true
      }
    ],
    formula: "score = ponderisana sredina (0-100).",
    tags: ["assessment"],
    country_support: ["ALL"]
  },
  {
    id: "commute_time_savings",
    name: "Ušteda vremena bez pendlanja",
    description: "Koliko sati/novca se štedi mesečno",
    category: "assessments",
    inputs: [
      {
        name: "oneWayMins",
        type: "number"
      },
      {
        name: "daysPerWeek",
        type: "number"
      },
      {
        name: "valuePerHour",
        type: "number"
      }
    ],
    outputs: [
      {
        name: "hoursSaved",
        type: "number"
      },
      {
        name: "valueSaved",
        type: "number"
      }
    ],
    formula: "hoursSaved = (oneWayMins*2/60)*daysPerWeek*4; valueSaved = hoursSaved*valuePerHour.",
    tags: ["productivity"],
    country_support: ["ALL"]
  }
];

export const calculatorCategories = [
  {
    id: "salary-tax",
    name: "Plata/Porezi",
    description: "Bruto/neto kalkulatori, poreske stope, doprinosi",
    icon: "💰",
    calculators: ["rs_net_gross", "hr_net_gross", "bg_net_gross", "ro_net_gross"]
  },
  {
    id: "freelance-rates",
    name: "Freelance & Satnice",
    description: "Efektivne satnice, day rates, fakture",
    icon: "💼",
    calculators: ["effective_hourly_rate", "salary_to_dayrate", "break_even_rate", "invoice_builder_simple"]
  },
  {
    id: "cost-of-living",
    name: "Cost of Living",
    description: "Poređenja gradova, budžet, troškovi",
    icon: "🏠",
    calculators: ["col_normalizer", "remote_office_costs"]
  },
  {
    id: "time-scheduling",
    name: "Vreme & Rasporedi",
    description: "Timezone overlap, PTO, meeting costs",
    icon: "⏰",
    calculators: ["timezone_overlap"]
  },
  {
    id: "assessments",
    name: "Procene & Skala",
    description: "Remote readiness, burnout risk, productivity",
    icon: "📊",
    calculators: ["remote_readiness_score", "commute_time_savings"]
  }
];
