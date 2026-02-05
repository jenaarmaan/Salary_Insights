export type Employee = {
  Emp_ID: string;
  Name: string;
  Department: string;
  Base_Salary: number;
  Bonus: number;
  Deductions: number;
  Month: string;
  Total_Salary: number;
  Predicted_Salary?: number;
  Lower_Bound?: number;
  Upper_Bound?: number;
  Confidence_Interval?: number;
  Anomaly_Label?: 'Anomaly' | 'Normal';
};

export type AnalysisResults = {
  employees: Employee[];
  fairness_insights: {
    disparate_impact_ratios: Record<string, number>;
    bias_alerts: string[];
    parity_score: number;
    recommendation: string;
  };
  drift_insights: {
    drift_detected: boolean;
    p_value: number;
    drift_score: number;
    status: string;
  };
};
