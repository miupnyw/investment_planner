// DCA (Dollar-Cost Averaging) calculation logic
export interface DCADataPoint {
    year: number;
    balance: number;
    principal: number;
}

// Computes the DCA results based on the given parameters
export interface DCAResult {
    data: DCADataPoint[];
    totalPrincipal: number;
    totalProfit: number;
    totalBalance: number;
}

const NUM_MONTHS = 12

/**
 * Calculates the DCA results
 * @param startPrincipal the initial amount invested at the start (can be 0)
 * @param monthlyDCA the fixed amount invested every month
 * @param annualReturnRate the expected annual return rate (in percentage, e.g., 7 for 7%)
 * @param totalYears the total number of years to calculate the DCA for
 * @returns the DCA results including yearly data points and totals
 */
export function computeDCA(
    startPrincipal: number,
    monthlyDCA: number,
    annualReturnRate: number,
    totalYears: number,
): DCAResult {
    const monthlyRate = annualReturnRate / 100 / NUM_MONTHS;
    const data: DCADataPoint[] = [];

    let balance = startPrincipal;
    let principal = startPrincipal;

    data.push({ year: 0, balance: Math.round(balance), principal: Math.round(principal) });

    // Calculate the balance and principal for each month and year
    for (let y = 1; y <= totalYears; y++) {
        // For each month, apply the monthly return and add the monthly DCA
        for (let m = 0; m < NUM_MONTHS; m++) {
            // Apply monthly return to the current balance, then add the monthly DCA
            balance = balance * (1 + monthlyRate) + monthlyDCA;

            // Update the total principal invested
            principal += monthlyDCA;
        }
        data.push({ year: y, balance: Math.round(balance), principal: Math.round(principal) });
    }

    const totalBalance = Math.round(balance);
    const totalPrincipal = Math.round(principal);
    const totalProfit = totalBalance - totalPrincipal;

    return { data, totalPrincipal, totalProfit, totalBalance };
}
