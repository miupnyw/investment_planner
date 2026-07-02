"use client";

// localStorage-backed store for the tax calculator inputs. Like the DCA inputs,
// this is a single small object, so we persist it as one JSON blob and expose a
// synchronous snapshot for useSyncExternalStore.

import type { TaxInputs } from "@/modules/tax/tax";
import { notifyStorage, subscribeStorage } from "./persistentStore";

const LS_KEY = "tax_inputs";

export const TAX_DEFAULTS: TaxInputs = {
  incomeItems: [{ id: "1", note: "", amountTHB: 600_000 }],
  hasSpouse: false,
  numChildren: 0,
  numChildren2ndPlus: 0,
  pregnancyExpense: 0,
  numParents: 0,
  numDisabled: 0,
  socialSecurity: 9_000,
  homeLoanInterest: 0,
  lifeInsurance: 0,
  healthInsurance: 0,
  pensionInsurance: 0,
  rmf: 0,
  thaiEsg: 0,
  generalDonation: 0,
  eduDonation: 0,
};

// useSyncExternalStore requires a stable snapshot reference, so cache the
// parsed object and only rebuild it when the raw localStorage string changes.
let cachedRaw: string | null = null;
let cachedInputs: TaxInputs = TAX_DEFAULTS;

export function getTaxInputsSnapshot(): TaxInputs {
  const raw = localStorage.getItem(LS_KEY);
  if (raw === cachedRaw) return cachedInputs;
  cachedRaw = raw;
  try {
    cachedInputs = raw ? { ...TAX_DEFAULTS, ...JSON.parse(raw) } : TAX_DEFAULTS;
  } catch {
    cachedInputs = TAX_DEFAULTS;
  }
  return cachedInputs;
}

// The server has no localStorage; render defaults to match the first paint.
export function getTaxInputsServerSnapshot(): TaxInputs {
  return TAX_DEFAULTS;
}

export function saveTaxInputs(inputs: TaxInputs) {
  localStorage.setItem(LS_KEY, JSON.stringify(inputs));
  notifyStorage();
}

export { subscribeStorage };
