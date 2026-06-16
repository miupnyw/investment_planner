// Thailand Personal Income Tax 2569 (2026)

export interface TaxBracket {
    min: number;
    max: number | null;
    rate: number;
    tax: number;
}

export interface TaxDeductions {
    employmentDeduction: number;
    personalAllowance: number;
    spouseAllowance: number;
    childAllowance: number;
    pregnancyDeduction: number;
    parentAllowance: number;
    disabledAllowance: number;
    socialSecurity: number;
    homeLoanInterest: number;
    lifeInsurance: number;
    healthInsurance: number;
    pensionInsurance: number;
    rmf: number;
    thaiEsg: number;
    generalDonation: number;
    eduDonation: number;
    total: number;
}

export interface TaxResult {
    grossIncome: number;
    deductions: TaxDeductions;
    netIncome: number;
    brackets: TaxBracket[];
    totalTax: number;
    effectiveRate: number;
    donationCap: number;
}

export interface IncomeItem {
    id: string;
    note: string;
    amountTHB: number;
}

export interface TaxInputs {
    incomeItems: IncomeItem[];
    // Personal & family
    hasSpouse: boolean;
    numChildren: number;          // 30,000 each
    numChildren2ndPlus: number;   // 2nd+ born from 2561 — extra 30,000 each (total 60,000)
    pregnancyExpense: number;     // actual, max 60,000
    numParents: number;           // 30,000 each, max 4 (age 60+, income < 30k/yr)
    numDisabled: number;          // 60,000 each
    // Savings & insurance
    socialSecurity: number;       // max 9,000
    homeLoanInterest: number;     // actual, max 100,000
    lifeInsurance: number;        // max 100,000 (combined with health ≤ 100,000)
    healthInsurance: number;      // max 25,000 (combined with life ≤ 100,000)
    pensionInsurance: number;     // 15% of income, max 200,000 (fills unused life cap → up to 300,000)
    // Retirement funds (pension + RMF combined ≤ 500,000)
    rmf: number;                  // 30% of income, max 500,000
    thaiEsg: number;              // 30% of income, max 300,000 (not in the 500k combined cap)
    // Donations (combined ≤ 10% of net income before donations)
    generalDonation: number;      // actual
    eduDonation: number;          // 2x actual (edu / sport / government hospital)
}

const BRACKETS_2569: Array<{ min: number; max: number | null; rate: number }> = [
    { min: 0,         max: 150_000,   rate: 0  },
    { min: 150_000,   max: 300_000,   rate: 5  },
    { min: 300_000,   max: 500_000,   rate: 10 },
    { min: 500_000,   max: 750_000,   rate: 15 },
    { min: 750_000,   max: 1_000_000, rate: 20 },
    { min: 1_000_000, max: 2_000_000, rate: 25 },
    { min: 2_000_000, max: 5_000_000, rate: 30 },
    { min: 5_000_000, max: null,      rate: 35 },
];

function cap(value: number, max: number): number {
    return Math.min(Math.max(0, value), max);
}

export function computeTax(inputs: TaxInputs): TaxResult {
    const {
        incomeItems,
        hasSpouse, numChildren, numChildren2ndPlus, pregnancyExpense, numParents, numDisabled,
        socialSecurity, homeLoanInterest,
        lifeInsurance, healthInsurance, pensionInsurance,
        rmf, thaiEsg,
        generalDonation, eduDonation,
    } = inputs;

    const annualIncome = incomeItems.reduce((sum, item) => sum + item.amountTHB, 0);

    // --- Personal & family ---
    const employmentDeduction  = cap(annualIncome * 0.5, 100_000);
    const personalAllowance    = 60_000;
    const spouseAllowance      = hasSpouse ? 60_000 : 0;
    const childAllowance       = cap(numChildren, 99) * 30_000 + cap(numChildren2ndPlus, 99) * 30_000;
    const pregnancyDeduction   = cap(pregnancyExpense, 60_000);
    const parentAllowance      = cap(numParents, 4) * 30_000;
    const disabledAllowance    = cap(numDisabled, 99) * 60_000;

    // --- Savings & insurance ---
    const socialSecurityDed    = cap(socialSecurity, 9_000);
    const homeLoanInterestDed  = cap(homeLoanInterest, 100_000);
    const lifeInsuranceDed     = cap(lifeInsurance, 100_000);
    // Health combined with life ≤ 100,000
    const healthInsuranceDed   = cap(healthInsurance, Math.min(25_000, 100_000 - lifeInsuranceDed));
    // Pension can fill the unused life-insurance cap (up to 100,000) plus its own 200,000 cap
    const pensionInsuranceDed  = cap(pensionInsurance, Math.min(annualIncome * 0.15, 300_000 - lifeInsuranceDed));

    // --- Retirement funds (pension + RMF combined ≤ 500,000) ---
    const thirtyPct = annualIncome * 0.3;
    const thaiEsgDed = cap(thaiEsg, Math.min(thirtyPct, 300_000));

    const retirementRemaining = Math.max(0, 500_000 - pensionInsuranceDed);
    const rmfDed  = cap(rmf, Math.min(thirtyPct, retirementRemaining, 500_000));

    // --- Subtotal before donations ---
    const subtotal =
        employmentDeduction + personalAllowance + spouseAllowance +
        childAllowance + pregnancyDeduction + parentAllowance + disabledAllowance +
        socialSecurityDed + homeLoanInterestDed +
        lifeInsuranceDed + healthInsuranceDed + pensionInsuranceDed +
        rmfDed + thaiEsgDed;

    const netBeforeDonations = Math.max(0, annualIncome - subtotal);
    const donationCap = netBeforeDonations * 0.1;

    // --- Donations (combined ≤ 10% of net before donations) ---
    // Edu donation counted at 2x; edu fills the cap first (higher multiplier = more value)
    const eduDonationDed     = cap(eduDonation * 2, donationCap);
    const generalDonationDed = cap(generalDonation, donationCap - eduDonationDed);

    const totalDeductions = subtotal + eduDonationDed + generalDonationDed;
    const netIncome = Math.max(0, annualIncome - totalDeductions);

    // --- Progressive tax ---
    const brackets: TaxBracket[] = BRACKETS_2569.map(({ min, max, rate }) => {
        const upper = max ?? Infinity;
        const taxable = Math.max(0, Math.min(netIncome, upper) - min);
        return { min, max, rate, tax: Math.round(taxable * rate / 100) };
    });

    const totalTax = brackets.reduce((sum, b) => sum + b.tax, 0);
    const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

    return {
        grossIncome: annualIncome,
        deductions: {
            employmentDeduction,
            personalAllowance,
            spouseAllowance,
            childAllowance,
            pregnancyDeduction,
            parentAllowance,
            disabledAllowance,
            socialSecurity: socialSecurityDed,
            homeLoanInterest: homeLoanInterestDed,
            lifeInsurance: lifeInsuranceDed,
            healthInsurance: healthInsuranceDed,
            pensionInsurance: pensionInsuranceDed,
            rmf: rmfDed,
            thaiEsg: thaiEsgDed,
            generalDonation: generalDonationDed,
            eduDonation: eduDonationDed,
            total: totalDeductions,
        },
        netIncome,
        brackets,
        totalTax,
        effectiveRate,
        donationCap,
    };
}
