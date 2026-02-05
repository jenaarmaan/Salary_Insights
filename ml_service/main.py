from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from ml_service.predictor import SalaryPredictor
from ml_service.anomaly_detector import AnomalyDetector
from ml_service.data_processor import DataProcessor
from ml_service.fairness_engine import FairnessEngine
from ml_service.drift_detector import DriftDetector
import pandas as pd

app = FastAPI(title="Salary Insights ML Service")
processor = DataProcessor()
predictor = SalaryPredictor()
detector = AnomalyDetector()
fairness_engine = FairnessEngine()
drift_detector = DriftDetector()

class EmployeeData(BaseModel):
    Emp_ID: str
    Name: str
    Department: str
    Base_Salary: float
    Bonus: float
    Deductions: float
    Month: str

@app.get("/")
async def root():
    return {"message": "Salary Insights ML Service is running"}

@app.post("/analyze")
async def analyze_salaries(employees: List[EmployeeData]):
    """
    End-to-end analysis: Processing -> Training (dynamic) -> Prediction -> Anomaly Detection
    """
    try:
        # 1. Parsing & Preprocessing
        data = [emp.model_dump() for emp in employees]
        df = pd.DataFrame(data)
        df['Total_Salary'] = df['Base_Salary'] + df['Bonus'] - df['Deductions']
        
        # Fit/Transform features
        processed_df = processor.fit_transform(df)
        
        # 2. Dynamic Training & Prediction
        # For small datasets, we fit on the fly to adapt to the specific context
        X = processed_df[['Base_Salary', 'Bonus', 'Deductions', 'Department_Encoded']]
        y = processed_df['Total_Salary']
        
        predictor.train(X, y)
        point_preds, lowers, uppers = predictor.predict(X)
        
        df['Predicted_Salary'] = point_preds
        df['Lower_Bound'] = lowers
        df['Upper_Bound'] = uppers
        df['Confidence_Interval'] = uppers - lowers
        
        # 3. Anomaly Detection
        detector.fit(X)
        df['Anomaly_Label'] = detector.detect(X)
        
        # 4. Phase 4: Fairness & Drift Detection
        fairness_insights = fairness_engine.analyze_parity(df)
        df = fairness_engine.mitigate_bias(df)
        
        drift_insights = drift_detector.check_drift(df['Total_Salary'].values)
        
        return {
            "employees": df.to_dict(orient="records"),
            "fairness_insights": fairness_insights,
            "drift_insights": drift_insights
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
