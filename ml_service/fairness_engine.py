import pandas as pd
import numpy as np
from typing import Dict, Any, List

class FairnessEngine:
    def __init__(self):
        self.protected_attribute = 'Department'

    def analyze_parity(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyzes pay parity across departments.
        Calculates Disparate Impact Ratio relative to the highest-paid department.
        """
        if df.empty or self.protected_attribute not in df.columns:
            return {"status": "error", "message": "Missing required data for fairness analysis"}

        # Group by department and calculate mean total salary
        dept_stats = df.groupby(self.protected_attribute)['Total_Salary'].mean().sort_values(ascending=False)
        
        if dept_stats.empty:
            return {"status": "empty"}

        highest_paid_val = dept_stats.iloc[0]
        ratios = (dept_stats / highest_paid_val).to_dict()
        
        # Flag departments with < 80% parity (common threshold for disparate impact)
        bias_alerts = [dept for dept, ratio in ratios.items() if ratio < 0.8]
        
        return {
            "disparate_impact_ratios": ratios,
            "bias_alerts": bias_alerts,
            "parity_score": np.mean(list(ratios.values())) * 100,
            "recommendation": "Review compensation in: " + ", ".join(bias_alerts) if bias_alerts else "No significant bias detected"
        }

    def mitigate_bias(self, df: pd.DataFrame, target_parity: float = 0.9) -> pd.DataFrame:
        """
        Returns a 'Fairness-Adjusted' salary recommendation (simulated mitigation).
        """
        # This is a passive mitigation: recommending what the salary 'should' be to reach 90% parity
        df_copy = df.copy()
        dept_means = df_copy.groupby(self.protected_attribute)['Total_Salary'].mean()
        max_mean = dept_means.max()
        
        target_mean = max_mean * target_parity
        
        def calculate_fair_salary(row):
            current_dept_mean = dept_means[row[self.protected_attribute]]
            if current_dept_mean < target_mean:
                # Suggest an adjustment to bring the dept average up
                adjustment_factor = target_mean / current_dept_mean
                return row['Predicted_Salary'] * adjustment_factor
            return row['Predicted_Salary']

        if 'Predicted_Salary' in df_copy.columns:
            df_copy['Fair_Salary_Adjustment'] = df_copy.apply(calculate_fair_salary, axis=1)
            
        return df_copy
