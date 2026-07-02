"use client";

import { useMemo, useState } from "react";
import {
  computeTax,
  IncomeItem,
  TaxInputs,
} from "@/modules/tax/tax";

const DEFAULTS: TaxInputs = {
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

/**
 * Tax form state plus the derived computation. The page only renders; all input
 * wiring and the (memoised) tax calculation live here.
 */
export function useTaxCalculator() {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULTS);

  function patch(p: Partial<TaxInputs>) {
    setInputs((prev) => ({ ...prev, ...p }));
  }

  function handleIncomeChange(items: IncomeItem[]) {
    patch({ incomeItems: items });
  }

  const result = useMemo(() => computeTax(inputs), [inputs]);

  return { inputs, patch, handleIncomeChange, result };
}
