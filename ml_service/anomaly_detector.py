from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
import pandas as pd
import numpy as np
from typing import List

class AnomalyDetector:
    def __init__(self):
        # Global outlier detection
        self.iso_forest = IsolationForest(contamination=0.1, random_state=42)
        
        # Local density-based detection
        # LOF is usually fit on the data it's used to predict
        self.lof = LocalOutlierFactor(n_neighbors=20, contamination=0.1, novelty=True)

    def fit(self, X: pd.DataFrame):
        """
        Fits models to the baseline data.
        """
        self.iso_forest.fit(X)
        self.lof.fit(X)

    def detect(self, X: pd.DataFrame) -> List[str]:
        """
        Returns a list of 'Anomaly' or 'Normal' labels.
        An employee is flagged if BOTH models agree it's an outlier (conservative ensemble).
        Or we can use a weighted score. For now, we'll use a combined logic.
        """
        iso_preds = self.iso_forest.predict(X) # -1 for anomaly, 1 for normal
        lof_preds = self.lof.predict(X)        # -1 for anomaly, 1 for normal
        
        labels = []
        for i, l in zip(iso_preds, lof_preds):
            # If either thinks it's an anomaly, we flag it (for high sensitivity)
            # In industry, you might require consensus depending on risk.
            if i == -1 or l == -1:
                labels.append('Anomaly')
            else:
                labels.append('Normal')
        
        return labels
