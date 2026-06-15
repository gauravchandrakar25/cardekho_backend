export interface BankRate {
  id: string;
  name: string;
  rate: number;
}

export interface RuleCheckDetails {
  downPaymentMet: boolean;
  loanTenureMet: boolean;
  emiLimitMet: boolean;
  cashflowHealthy: boolean;
}

export interface AffordabilityResult {
  status: 'Safe' | 'Stretching' | 'Unsafe';
  score: number; // 0 to 100
  maxCarPrice: number; // in Lakhs
  maxAllowedEMI: number; // in Rs
  actualCarEMI: number; // in Rs
  downPaymentRequired: number; // in Lakhs
  loanAmount: number; // in Lakhs
  totalFixedCommitmentPercent: number; // (fixedExpenses + actualEMI) / monthlySalary * 100
  ruleChecks: RuleCheckDetails;
}

class FinancialService {
  private bankRates: BankRate[] = [
    { id: 'sbi', name: 'SBI Car Loan', rate: 8.75 },
    { id: 'hdfc', name: 'HDFC Bank', rate: 9.10 },
    { id: 'icici', name: 'ICICI Bank', rate: 9.20 },
    { id: 'axis', name: 'Axis Bank', rate: 9.35 }
  ];

  /**
   * Get all available bank loan interest rates
   */
  public getBankRates(): BankRate[] {
    return this.bankRates;
  }

  /**
   * Calculate EMI using compound interest formula
   * EMI = [P x r x (1+r)^n] / [((1+r)^n) - 1]
   */
  public calculateEMI(principalLakhs: number, annualRate: number, tenureMonths: number): number {
    const principal = principalLakhs * 100000; // convert Lakhs to absolute Rupees
    const monthlyRate = (annualRate / 12) / 100;
    
    if (monthlyRate === 0) {
      return principal / tenureMonths;
    }
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
                
    return Math.round(emi);
  }

  /**
   * Back-calculate maximum principal amount from an EMI
   * P = EMI / [ (r * (1+r)^n) / ((1+r)^n - 1) ]
   */
  public calculateMaxPrincipal(emiLimit: number, annualRate: number, tenureMonths: number): number {
    const monthlyRate = (annualRate / 12) / 100;
    
    if (monthlyRate === 0) {
      return (emiLimit * tenureMonths) / 100000;
    }
    
    const factor = (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                   (Math.pow(1 + monthlyRate, tenureMonths) - 1);
                   
    const principal = emiLimit / factor;
    return principal / 100000; // Convert to Lakhs
  }

  /**
   * Evaluate affordability for a specific car price under 20/4/10 rule
   */
  public evaluateAffordability(
    carPriceLakhs: number,
    monthlySalary: number,
    fixedExpenses: number,
    annualRate: number = 8.75 // Default to SBI rate
  ): AffordabilityResult {
    const tenureMonths = 48; // 4-year tenure limit as per 20/4/10 rule
    const maxAllowedEMI = Math.round(monthlySalary * 0.10); // 10% EMI limit
    
    // Down payment is exactly 20%
    const downPaymentRequired = carPriceLakhs * 0.20; 
    const loanAmount = carPriceLakhs * 0.80;
    
    // Calculate actual EMI based on the 80% loan amount over 4 years
    const actualCarEMI = this.calculateEMI(loanAmount, annualRate, tenureMonths);
    
    // Calculate maximum affordable car price
    const maxLoanAmount = this.calculateMaxPrincipal(maxAllowedEMI, annualRate, tenureMonths);
    const maxCarPrice = maxLoanAmount / 0.80; // Total car value based on 20% down payment

    // Rule validation checks
    const downPaymentMet = true; // User assumes they pay the 20% down payment
    const loanTenureMet = true; // Restricted to 4 years
    const emiLimitMet = actualCarEMI <= maxAllowedEMI;
    
    // Cashflow health check: fixed expenses + new EMI should leave room
    const totalCommitment = fixedExpenses + actualCarEMI;
    const totalFixedCommitmentPercent = parseFloat(((totalCommitment / monthlySalary) * 100).toFixed(1));
    const cashflowHealthy = totalFixedCommitmentPercent <= 70;

    // Determine affordability status
    let status: 'Safe' | 'Stretching' | 'Unsafe' = 'Safe';
    let score = 95;

    const emiRatio = actualCarEMI / maxAllowedEMI; // 1.0 means exactly 10% of salary
    
    if (emiRatio <= 1.0 && cashflowHealthy) {
      status = 'Safe';
      // Map safe to score 85 - 100
      score = Math.round(100 - (15 * (emiRatio)));
    } else if (emiRatio <= 1.5 && totalFixedCommitmentPercent <= 85) {
      status = 'Stretching';
      // Map stretching to score 50 - 84
      const stretchingProgress = (emiRatio - 1.0) / 0.5; // 0 to 1
      score = Math.round(84 - (34 * stretchingProgress));
    } else {
      status = 'Unsafe';
      // Map unsafe to score 10 - 49
      const unsafeProgress = Math.min((emiRatio - 1.5) / 1.0, 1); // scale progress
      score = Math.round(49 - (39 * unsafeProgress));
    }

    // Ensure scores are bound within safe values
    score = Math.max(10, Math.min(100, score));

    return {
      status,
      score,
      maxCarPrice: parseFloat(maxCarPrice.toFixed(2)),
      maxAllowedEMI,
      actualCarEMI,
      downPaymentRequired: parseFloat(downPaymentRequired.toFixed(2)),
      loanAmount: parseFloat(loanAmount.toFixed(2)),
      totalFixedCommitmentPercent,
      ruleChecks: {
        downPaymentMet,
        loanTenureMet,
        emiLimitMet,
        cashflowHealthy
      }
    };
  }
}

export const financialService = new FinancialService();
