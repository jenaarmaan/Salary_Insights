import pandas as pd
import numpy as np
from scipy.stats import ks_2samp
from typing import Dict, Any, Optional

class DriftDetector:
    def __init__(self):
        self.baseline_distribution: Optional[np.ndarray] = None

    def check_drift(self, current_salaries: np.ndarray) -> Dict[str, Any]:
        """
        Uses Kolmogorov-Smirnov test to detect distribution drift.
        """
        if self.baseline_distribution is None:
            # First run: set baseline
            self.baseline_distribution = current_salaries
            return {
                "drift_detected": False,
                "status": "Baseline established",
                "p_value": 1.0
            }

        # Compare current with baseline
        statistic, p_value = ks_2samp(self.baseline_distribution, current_salaries)
        
        # p-value < 0.05 indicates significant difference (drift)
        drift_detected = p_value < 0.05
        
        return {
            "drift_detected": bool(drift_detected),
            "p_value": float(p_value),
            "drift_score": float(statistic),
            "status": "Significant drift detected" if drift_detected else "Distributions are stable"
        }

    def update_baseline(self, new_baseline: np.ndarray):
        self.baseline_distribution = new_baseline
