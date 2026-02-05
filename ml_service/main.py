from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from ml_service.data_processor import DataProcessor

app = FastAPI(title="Salary Insights ML Service")
processor = DataProcessor()

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

@app.post("/process-data")
async def process_data(employees: List[EmployeeData]):
    try:
        # Convert Pydantic models to a list of dicts then to DataFrame
        data = [emp.model_dump() for emp in employees]
        import pandas as pd
        df = pd.DataFrame(data)
        
        # Calculate Total_Salary for fitting/transforming
        df['Total_Salary'] = df['Base_Salary'] + df['Bonus'] - df['Deductions']
        
        # Initial processing (Target Encoding)
        processed_df = processor.fit_transform(df)
        
        return processed_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
