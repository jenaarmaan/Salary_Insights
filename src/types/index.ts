export type Employee = {
  Emp_ID: string;
  Name: string;
  Department: string;
  Base_Salary: number;
  Bonus: number;
  Deductions: number;
  Month: string;
  Total_Salary: number;
  Predicted_Salary: number;
  Anomaly_Label?: 'Anomaly' | 'Normal';
};
