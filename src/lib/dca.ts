// DCA (Dollar-Cost Averaging) calculation logic
export interface DCADataPoint {
  year: number;
  balance: number;
  principal: number;
  coasting: boolean;
}

// Computes the DCA results based on the given parameters
export interface DCAResult {
  data: DCADataPoint[];
  totalPrincipal: number;
  totalProfit: number;
  totalBalance: number;
}

const NUM_MONTHS = 12;

/**
 * Calculates the DCA results
 * @param startPrincipal the initial amount invested at the start (can be 0)
 * @param monthlyDCA the fixed amount invested every month
 * @param annualReturnRate the expected annual return rate (in percentage, e.g., 7 for 7%)
 * @param investYears the total number of years to actively contribute DCA
 * @param coastYears the number of years after DCA stops but before retirement
 * @returns the DCA results including yearly data points and totals
 */
export function computeDCA(
  startPrincipal: number,
  monthlyDCA: number,
  annualReturnRate: number,
  investYears: number,
  coastYears: number = 0,
): DCAResult {
  const monthlyRate = annualReturnRate / 100 / NUM_MONTHS;
  const data: DCADataPoint[] = [];
  const totalYears = investYears + coastYears;

  let balance = startPrincipal;
  let principal = startPrincipal;

  data.push({
    year: 0,
    balance: Math.round(balance),
    principal: Math.round(principal),
    coasting: false,
  });

  // Calculate the balance and principal for each month and year
  for (let y = 1; y <= totalYears; y++) {
    const isCoasting = y > investYears;
    const contribution = isCoasting ? 0 : monthlyDCA;

    // For each month, apply the monthly return and add the monthly DCA
    for (let m = 0; m < NUM_MONTHS; m++) {
      // Apply monthly return to the current balance, then add the monthly DCA
      balance = balance * (1 + monthlyRate) + contribution;

      // Update the total principal invested
      principal += contribution;
    }
    data.push({
      year: y,
      balance: Math.round(balance),
      principal: Math.round(principal),
      coasting: isCoasting,
    });
  }

  return {
    data,
    totalPrincipal: Math.round(principal),
    totalProfit: Math.round(balance) - Math.round(principal),
    totalBalance: Math.round(balance),
  };
}
