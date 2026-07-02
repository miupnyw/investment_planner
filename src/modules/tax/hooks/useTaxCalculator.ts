"use client";

import { useMemo, useSyncExternalStore } from "react";
import { computeTax, IncomeItem, TaxInputs } from "@/modules/tax/tax";
import {
  getTaxInputsServerSnapshot,
  getTaxInputsSnapshot,
  saveTaxInputs,
  subscribeStorage,
} from "@/store/taxInputsStore";

/**
 * Tax form state plus the derived computation. Inputs are persisted in
 * localStorage and read via an external store, so edits go straight to storage.
 * The page only renders; all input wiring and the (memoised) tax calculation
 * live here.
 */
export function useTaxCalculator() {
  const inputs = useSyncExternalStore(
    subscribeStorage,
    getTaxInputsSnapshot,
    getTaxInputsServerSnapshot,
  );

  function patch(p: Partial<TaxInputs>) {
    saveTaxInputs({ ...inputs, ...p });
  }

  function handleIncomeChange(items: IncomeItem[]) {
    patch({ incomeItems: items });
  }

  const result = useMemo(() => computeTax(inputs), [inputs]);

  return { inputs, patch, handleIncomeChange, result };
}
