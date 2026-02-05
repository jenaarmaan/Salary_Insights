import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import ElasticNet
from typing import Tuple, Dict, Any

class SalaryPredictor:
    def __init__(self):
        # Base models
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
        
        # Meta-learner for stacking
        self.meta_learner = ElasticNet(alpha=0.1, l1_ratio=0.5)
        
        # Models for Quantile Regression (Confidence Intervals)
        # 0.05 and 0.95 quantiles for 90% confidence interval
        self.lower_quantile_model = XGBRegressor(objective='reg:quantileerror', quantile_alpha=0.05, n_estimators=100)
        self.upper_quantile_model = XGBRegressor(objective='reg:quantileerror', quantile_alpha=0.95, n_estimators=100)

    def train(self, X: pd.DataFrame, y: pd.Series):
        """
        Trains the stacked ensemble and quantile models.
        In a production environment, this would use cross-validation for stacking.
        """
        # Fit base models
        self.rf_model.fit(X, y)
        self.xgb_model.fit(X, y)
        
        # Generate predictions for meta-learner training
        rf_preds = self.rf_model.predict(X)
        xgb_preds = self.xgb_model.predict(X)
        
        # Stack base predictions as features for the meta-learner
        stacked_features = np.column_stack((rf_preds, xgb_preds))
        self.meta_learner.fit(stacked_features, y)
        
        # Fit quantile models
        self.lower_quantile_model.fit(X, y)
        self.upper_quantile_model.fit(X, y)

    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Returns (Point Prediction, Lower Bound, Upper Bound)
        """
        rf_preds = self.rf_model.predict(X)
        xgb_preds = self.xgb_model.predict(X)
        
        stacked_features = np.column_stack((rf_preds, xgb_preds))
        point_predictions = self.meta_learner.predict(stacked_features)
        
        lower_bounds = self.lower_quantile_model.predict(X)
        upper_bounds = self.upper_quantile_model.predict(X)
        
        return point_predictions, lower_bounds, upper_bounds

# Note: In this project, we might "fake" a training step if the data is small, 
# but the architecture supports full retraining.
