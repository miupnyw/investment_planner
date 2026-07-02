"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { computeDCA } from "@/modules/dca/dca";
import {
  DCAInputs,
  getInputsServerSnapshot,
  getInputsSnapshot,
  saveInputs,
  subscribeStorage,
} from "@/store/dcaInputsStore";

/**
 * All the state + derived values for the DCA planner page. Inputs are persisted
 * in localStorage and read via an external store, so writes go straight to
 * storage instead of through a setState-in-effect. The page stays presentational.
 */
export function useDcaPlanner() {
  const { fmt, symbol, toTHB, toDisplay } = useCurrency();

  const inputs = useSyncExternalStore(
    subscribeStorage,
    getInputsSnapshot,
    getInputsServerSnapshot,
  );
  const {
    startAge,
    endAge,
    retireAge,
    annualReturn,
    startPrincipalTHB,
    monthlyDCABase,
    withdrawalRate,
  } = inputs;

  const update = (patch: Partial<DCAInputs>) =>
    saveInputs({ ...inputs, ...patch });

  // Money fields are stored in THB but shown in the display currency; convert on
  // the way out and back on the way in.
  const startPrincipalDisplay =
    startPrincipalTHB === ""
      ? ""
      : String(Math.round(toDisplay(parseFloat(startPrincipalTHB) || 0)));
  const monthlyDCADisplay =
    monthlyDCABase === ""
      ? ""
      : String(Math.round(toDisplay(parseFloat(monthlyDCABase) || 0)));

  const setStartPrincipal = (raw: string) =>
    update({
      startPrincipalTHB:
        raw === "" ? "" : String(Math.round(toTHB(parseFloat(raw) || 0))),
    });
  const setMonthlyDCA = (raw: string) =>
    update({
      monthlyDCABase:
        raw === "" ? "" : String(Math.round(toTHB(parseFloat(raw) || 0))),
    });

  const startAgeNum = parseFloat(startAge) || 0;
  const endAgeNum = parseFloat(endAge) || 0;
  const retireAgeNum = parseFloat(retireAge) || 0;
  const investYears = Math.max(0, endAgeNum - startAgeNum);
  const coastYears = Math.max(0, retireAgeNum - endAgeNum);

  const currentYear = new Date().getFullYear();
  const coastStartYear = currentYear + investYears;
  const retireYear = currentYear + Math.max(0, retireAgeNum - startAgeNum);

  const result = useMemo(
    () =>
      computeDCA(
        parseFloat(startPrincipalTHB) || 0,
        parseFloat(monthlyDCABase) || 0,
        parseFloat(annualReturn) || 0,
        investYears,
        coastYears,
      ),
    [startPrincipalTHB, monthlyDCABase, annualReturn, investYears, coastYears],
  );

  const withdrawalRateNum = parseFloat(withdrawalRate) || 0;
  const annualPassiveIncome = (result.totalBalance * withdrawalRateNum) / 100;
  const monthlyPassiveIncome = annualPassiveIncome / 12;

  const chartData = useMemo(
    () =>
      result.data.map((point) => ({
        ...point,
        calendarYear: currentYear + point.year,
      })),
    [result.data, currentYear],
  );

  return {
    // currency helpers
    fmt,
    symbol,
    // raw input fields
    startAge,
    endAge,
    retireAge,
    annualReturn,
    withdrawalRate,
    startPrincipalDisplay,
    monthlyDCADisplay,
    // derived timeline
    investYears,
    coastYears,
    currentYear,
    coastStartYear,
    retireYear,
    retireAgeNum,
    // computed results
    result,
    chartData,
    annualPassiveIncome,
    monthlyPassiveIncome,
    // handlers
    update,
    setStartPrincipal,
    setMonthlyDCA,
  };
}
