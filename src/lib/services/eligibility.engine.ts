/**
 * VSM Central Lending & Eligibility Engine
 * Single Source of Truth for:
 * 1. Affordability & DTI assessment
 * 2. Risk scoring (Low, Medium, High)
 * 3. Pre-qualification limits
 * 4. NCR-compliant loan repayment calculations (Principal, Interest, Monthly Instalment, Total Payable)
 * 5. Statutory disclaimers & customer guidance
 */

export interface LendingRulesConfig {
  annualInterestRate: number; // e.g. 18.0 for 18% p.a.
  initiationFeePercent: number; // e.g. 0% or standard NCA flat
  maxDtiPercent: number; // Max total expenses/salary ratio, e.g. 70%
  maxDisposableCommitment: number; // Max percentage of disposable income for loan, e.g. 35%
  minLoanAmount: number;
  maxLoanAmount: number;
  allowedTerms: number[]; // [3, 6, 12, 18, 24]
  minimumSalary: number; // e.g. R 3,000
}

export const DEFAULT_LENDING_CONFIG: LendingRulesConfig = {
  annualInterestRate: 18.0,
  initiationFeePercent: 0,
  maxDtiPercent: 70,
  maxDisposableCommitment: 0.35,
  minLoanAmount: 1000,
  maxLoanAmount: 50000,
  allowedTerms: [3, 6, 12, 18, 24],
  minimumSalary: 3000,
};

export type RiskCategory = 'Low' | 'Medium' | 'High';

export interface EligibilityInput {
  salary: number;
  expenses: number;
  existingObligations?: number;
  requestedAmount?: number;
  termMonths?: number;
  employmentType?: string; // 'Full-Time', 'Contract', 'Self-Employed', 'Part-Time'
  loanPurpose?: string;
}

export interface RepaymentCalculation {
  principal: number;
  annualRate: number;
  monthlyRate: number;
  termMonths: number;
  monthlyInstalment: number;
  totalInterest: number;
  totalPayable: number;
  dailyRate: number;
}

export interface EligibilityResult {
  isEligible: boolean;
  maxQualifiedAmount: number;
  recommendedAmount: number;
  recommendedTerm: number;
  disposableIncome: number;
  debtToIncomeRatio: number;
  riskCategory: RiskCategory;
  repayment: RepaymentCalculation;
  disclaimer: string;
  reasons: string[];
}

/**
 * Precise currency rounding to 2 decimal places to avoid floating point drift
 */
export function roundCurrency(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Authoritative loan repayment calculator using standard amortization formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateAmortization(
  principal: number,
  termMonths = 6,
  annualInterestRate = DEFAULT_LENDING_CONFIG.annualInterestRate
): RepaymentCalculation {
  const p = Math.max(0, principal);
  const n = Math.max(1, termMonths);
  const rate = Math.max(0, annualInterestRate);

  if (p === 0) {
    return {
      principal: 0,
      annualRate: rate,
      monthlyRate: 0,
      termMonths: n,
      monthlyInstalment: 0,
      totalInterest: 0,
      totalPayable: 0,
      dailyRate: 0,
    };
  }

  const monthlyRate = (rate / 100) / 12;

  let monthlyInstalment: number;
  if (monthlyRate === 0) {
    monthlyInstalment = roundCurrency(p / n);
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyInstalment = roundCurrency((p * monthlyRate * factor) / (factor - 1));
  }

  const totalPayable = roundCurrency(monthlyInstalment * n);
  const totalInterest = roundCurrency(totalPayable - p);
  const dailyRate = roundCurrency((rate / 365) * 100) / 100;

  return {
    principal: p,
    annualRate: rate,
    monthlyRate: roundCurrency(monthlyRate * 10000) / 100, // percentage e.g. 1.5%
    termMonths: n,
    monthlyInstalment,
    totalInterest,
    totalPayable,
    dailyRate,
  };
}

/**
 * Evaluates applicant eligibility against configurable lending rules
 */
export function evaluateEligibility(
  input: EligibilityInput,
  config: LendingRulesConfig = DEFAULT_LENDING_CONFIG
): EligibilityResult {
  const salary = Math.max(0, Number(input.salary) || 0);
  const expenses = Math.max(0, Number(input.expenses) || 0);
  const obligations = Math.max(0, Number(input.existingObligations) || 0);
  const totalCommittedExpenses = expenses + obligations;

  const disposableIncome = Math.max(0, salary - totalCommittedExpenses);
  const debtToIncomeRatio = salary > 0 ? (totalCommittedExpenses / salary) * 100 : 100;

  const reasons: string[] = [];

  // 1. Minimum Salary Check
  if (salary < config.minimumSalary) {
    reasons.push(`Gross salary of R ${salary.toLocaleString()} is below the minimum required threshold of R ${config.minimumSalary.toLocaleString()}/month.`);
  }

  // 2. DTI Check
  if (debtToIncomeRatio > config.maxDtiPercent) {
    reasons.push(`Total declared expenses represent ${debtToIncomeRatio.toFixed(1)}% of income, exceeding our maximum affordability ceiling of ${config.maxDtiPercent}%.`);
  }

  // 3. Disposable Income Check
  if (disposableIncome <= 1000) {
    reasons.push(`Net disposable income of R ${disposableIncome.toLocaleString()} is insufficient to support monthly loan instalments.`);
  }

  // Calculate Risk Level
  let riskCategory: RiskCategory = 'Low';
  if (debtToIncomeRatio > 60 || disposableIncome < 3000 || input.employmentType === 'Part-Time') {
    riskCategory = 'High';
  } else if (debtToIncomeRatio > 45 || disposableIncome < 6000 || input.employmentType === 'Contract') {
    riskCategory = 'Medium';
  }

  // Calculate Maximum Affordable Principal
  // max allowable monthly payment = disposableIncome * maxDisposableCommitment
  const maxMonthlyPayment = disposableIncome * config.maxDisposableCommitment;
  const maxTerm = Math.max(...config.allowedTerms);
  const r = (config.annualInterestRate / 100) / 12;

  let maxPrincipal = 0;
  if (r > 0 && maxMonthlyPayment > 0) {
    const factor = Math.pow(1 + r, maxTerm);
    maxPrincipal = (maxMonthlyPayment * (factor - 1)) / (r * factor);
  } else {
    maxPrincipal = maxMonthlyPayment * maxTerm;
  }

  // Cap at config limit and step to nearest R 500
  const maxQualifiedAmount = Math.max(
    0,
    Math.min(config.maxLoanAmount, Math.floor(maxPrincipal / 500) * 500)
  );

  const isEligible = reasons.length === 0 && maxQualifiedAmount >= config.minLoanAmount;

  // Selected or recommended terms
  const targetTerm = input.termMonths && config.allowedTerms.includes(input.termMonths) ? input.termMonths : 6;
  const requested = input.requestedAmount ? Math.min(input.requestedAmount, maxQualifiedAmount) : Math.min(8900, maxQualifiedAmount);
  const activeAmount = isEligible ? Math.max(config.minLoanAmount, requested) : 0;

  const repayment = calculateAmortization(activeAmount, targetTerm, config.annualInterestRate);

  const disclaimer =
    'Estimated eligibility only. Final loan approval, interest rate, and instalment amounts are subject to document verification, credit bureau scoring, and VSM lending policy compliance under the National Credit Act (NCA).';

  return {
    isEligible,
    maxQualifiedAmount,
    recommendedAmount: activeAmount,
    recommendedTerm: targetTerm,
    disposableIncome,
    debtToIncomeRatio: roundCurrency(debtToIncomeRatio),
    riskCategory,
    repayment,
    disclaimer,
    reasons,
  };
}

export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const calculateEligibility = evaluateEligibility;

