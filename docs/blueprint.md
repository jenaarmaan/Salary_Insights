# **App Name**: Salary Insights

## Core Features:

- CSV Upload: Allow users to upload employee salary data in .csv format. Expected fields: Emp_ID, Name, Department, Base_Salary, Bonus, Deductions, Month.
- Data Display: Render the uploaded CSV in a paginated table. Include column sorting and simple validation (e.g., null checks, number format).
- Salary Prediction: Use a Linear Regression model to predict Total_Salary. The model will consider: Base_Salary, Bonus, and Deductions. Add a new column Predicted_Salary. 
- Anomaly Detection: Use Isolation Forest to detect anomalies in salary distribution. Add a new column Anomaly_Label with values: 'Anomaly' or 'Normal'.
- Department-wise Pie Chart: Visualize total salary distribution across departments using an interactive pie chart.
- Predicted vs Actual Salary Chart: Display a bar chart comparing Total_Salary and Predicted_Salary for each employee.

## Style Guidelines:

- Grid-based layout using CSS Grid or Tailwind’s grid utility for responsiveness and clean data partition.
- Use 'PT Sans' for both headings and body — professional, clean, readable.
- Primary: #4F46E5 (Indigo)
- Secondary: #10B981 (Emerald)
- Background: #F9FAFB
- Text: #111827
- Use Material Design Icons to indicate CSV upload, Alert/anomaly, Department group, Chart view