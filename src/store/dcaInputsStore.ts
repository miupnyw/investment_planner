"use client";

// localStorage-backed store for the DCA planner inputs. IndexedDB isn't needed
// here — the inputs are a single small object — so we persist them as one JSON
// blob and expose a synchronous snapshot for useSyncExternalStore.

import { notifyStorage, subscribeStorage } from "./persistentStore";

const LS_KEY = "dca_inputs";

export interface DCAInputs {
  startAge: string;
  endAge: string;
  retireAge: string;
  annualReturn: string;
  startPrincipalTHB: string;
  monthlyDCABase: string;
  withdrawalRate: string;
}

export const DCA_DEFAULTS: DCAInputs = {
  startAge: "25",
  endAge: "40",
  retireAge: "60",
  annualReturn: "7",
  startPrincipalTHB: "100000",
  monthlyDCABase: "1000",
  withdrawalRate: "4",
};

// useSyncExternalStore requires a stable snapshot reference, so cache the
// parsed object and only rebuild it when the raw localStorage string changes.
let cachedRaw: string | null = null;
let cachedInputs: DCAInputs = DCA_DEFAULTS;

export function getInputsSnapshot(): DCAInputs {
  const raw = localStorage.getItem(LS_KEY);
  if (raw === cachedRaw) return cachedInputs;
  cachedRaw = raw;
  try {
    cachedInputs = raw ? { ...DCA_DEFAULTS, ...JSON.parse(raw) } : DCA_DEFAULTS;
  } catch {
    cachedInputs = DCA_DEFAULTS;
  }
  return cachedInputs;
}

// The server has no localStorage; render defaults to match the first paint.
export function getInputsServerSnapshot(): DCAInputs {
  return DCA_DEFAULTS;
}

export function saveInputs(inputs: DCAInputs) {
  localStorage.setItem(LS_KEY, JSON.stringify(inputs));
  notifyStorage();
}

export { subscribeStorage };
