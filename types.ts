export interface CalculatorState {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentMonthlyExpenses: number;
  lifestyleFactor: number;
  existingSavings: number;
  assumedInflation: number;
  postRetirementROI: number;
  specificGoals: string;
}

export interface CalculationResult {
  yearsToRetirement: number;
  yearsInRetirement: number;
  monthlyExpenseAtRetirement: number;
  requiredCorpus: number;
  projectedExistingSavings: number;
  gap: number;
  chartData: Array<{
    age: number;
    balance: number;
    expenses: number;
  }>;
}

export enum LifestyleType {
  MAINTAIN = 1,
  UPGRADE = 1.5,
  LUXURY = 2,
}

export enum InvestmentProfile {
  CONSERVATIVE = 0.06,
  BALANCED = 0.08,
  AGGRESSIVE = 0.10,
}