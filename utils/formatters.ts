export const formatINR = (amount: number): string => {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCompactINR = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
};

export const calculateRetirementMetrics = (
  state: import('../types').CalculatorState
): import('../types').CalculationResult => {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentMonthlyExpenses,
    lifestyleFactor,
    existingSavings,
    assumedInflation,
    postRetirementROI
  } = state;

  const inflationRate = assumedInflation / 100;
  const roiRate = postRetirementROI; // This is an annual rate
  
  // Timeframes
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);

  // Expense Calculations
  const adjustedBaseMonthly = currentMonthlyExpenses * lifestyleFactor;
  // FV of Expenses at start of retirement
  const monthlyExpenseAtRetirement = adjustedBaseMonthly * Math.pow(1 + inflationRate, yearsToRetirement);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // Corpus Requirement Calculation (PV of Growing Annuity)
  // We need a corpus that can support withdrawals growing at inflation rate, earning ROI
  
  let requiredCorpus = 0;

  // Real Rate of Return = (1 + Nominal) / (1 + Inflation) - 1
  const realRate = (1 + roiRate) / (1 + inflationRate) - 1;

  if (yearsInRetirement > 0) {
    if (Math.abs(realRate) < 0.0001) {
       // If Real Rate is ~0 (ROI == Inflation)
       requiredCorpus = annualExpenseAtRetirement * yearsInRetirement;
    } else {
       // PV = PMT * [ (1 - (1+r)^-n) / r ]
       // Note: This formula assumes payments at END of year. For beginning (due), multiply by (1+realRate).
       // We'll stick to end of year for simplicity standard in these calculators.
       requiredCorpus = annualExpenseAtRetirement * (
         (1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate
       );
    }
  }

  // Existing Savings Projection
  // Assuming existing savings grow at a standard 10% (Aggressive/Equity) during accumulation phase
  // Or purely at the selected ROI. To be safe/consistent, let's use the selected ROI or a blended rate.
  // We'll use the user selected ROI to keep it deterministic based on their input, or maybe slightly higher?
  // Let's stick to the user's ROI input for simplicity, but usually accumulation is higher. 
  // We will assume 10% for accumulation phase as a standard equity benchmark for long term, 
  // but if the user selected a very low ROI, we might want to respect that. 
  // Let's use 10% for accumulation (pre-retirement) and the user input for distribution (post-retirement).
  const accumulationRate = 0.10; 
  const projectedExistingSavings = existingSavings * Math.pow(1 + accumulationRate, yearsToRetirement);

  const gap = Math.max(0, requiredCorpus - projectedExistingSavings);

  // Chart Data Generation
  const chartData = [];
  let currentBalance = requiredCorpus;
  let currentAnnualExpense = annualExpenseAtRetirement;

  for (let year = 0; year <= yearsInRetirement + 5; year++) { // +5 to show what happens after
    const age = retirementAge + year;
    
    if (age > lifeExpectancy + 5) break;

    chartData.push({
      age,
      balance: Math.max(0, Math.round(currentBalance)),
      expenses: Math.round(currentAnnualExpense)
    });

    if (age < lifeExpectancy) {
       // Deduct expenses first (beginning of year provision) or end? 
       // Let's do: Balance grows, then expense is deducted (End of year)
       const growth = currentBalance * roiRate;
       currentBalance = currentBalance + growth - currentAnnualExpense;
       
       // Inflation hits expenses for next year
       currentAnnualExpense = currentAnnualExpense * (1 + inflationRate);
    } else {
      // After life expectancy, just show decay if any left or 0
      currentBalance = 0;
    }
  }

  return {
    yearsToRetirement,
    yearsInRetirement,
    monthlyExpenseAtRetirement,
    requiredCorpus,
    projectedExistingSavings,
    gap,
    chartData
  };
};