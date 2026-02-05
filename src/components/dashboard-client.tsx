"use client";
/**
 * DashboardClient component for Salary Insights.
 * Handles CSV upload, ML analysis, and visualization.
 */

import React from 'react';
import { useState, useMemo, useRef, ChangeEvent } from 'react';
import type { Employee, AnalysisResults } from '@/types';
import { analyzeSalaries } from '@/lib/ml-service';
import { useToast } from "@/hooks/use-toast";

import { UploadCloud, FileText, BarChart3, PieChart, AlertTriangle, Building2, Loader2, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmployeeDataTable } from '@/components/employee-data-table';
import { DepartmentPieChart } from '@/components/charts/department-pie-chart';
import { SalaryComparisonChart } from '@/components/charts/salary-comparison-chart';

export default function DashboardClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fairnessInsights, setFairnessInsights] = useState<AnalysisResults['fairness_insights'] | null>(null);
  const [driftInsights, setDriftInsights] = useState<AnalysisResults['drift_insights'] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a .csv file.',
        });
        return;
      }

      setFileName(file.name);
      setIsProcessing(true);
      setEmployees([]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
          const headers = rows[0].split(',').map(h => h.trim());
          const requiredHeaders = ['Emp_ID', 'Name', 'Department', 'Base_Salary', 'Bonus', 'Deductions', 'Month'];

          if (!requiredHeaders.every(h => headers.includes(h))) {
            throw new Error('CSV must include required headers: Emp_ID, Name, Department, Base_Salary, Bonus, Deductions, Month');
          }

          const parsedData: Employee[] = rows.slice(1).map((row: string, i: number) => {
            const values = row.split(',');
            const entry: any = {};
            headers.forEach((header, index) => {
              entry[header] = values[index]?.trim();
            });

            const baseSalary = parseFloat(entry.Base_Salary);
            const bonus = parseFloat(entry.Bonus);
            const deductions = parseFloat(entry.Deductions);

            if (isNaN(baseSalary) || isNaN(bonus) || isNaN(deductions)) {
              throw new Error(`Invalid number format in row ${i + 2}.`);
            }

            return {
              Emp_ID: entry.Emp_ID,
              Name: entry.Name,
              Department: entry.Department,
              Month: entry.Month,
              Base_Salary: baseSalary,
              Bonus: bonus,
              Deductions: deductions,
              Total_Salary: baseSalary + bonus - deductions,
            };
          });

          // Analyze salaries using the unified ML service
          const results = await analyzeSalaries(parsedData);
          setEmployees(results.employees);
          setFairnessInsights(results.fairness_insights);
          setDriftInsights(results.drift_insights);

        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error Processing File',
            description: error.message || 'An unknown error occurred.',
          });
          setFileName('');
          setEmployees([]);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const departmentData = useMemo(() => {
    if (!employees.length) return [];
    const deptMap = new Map<string, number>();
    employees.forEach((emp: Employee) => {
      deptMap.set(emp.Department, (deptMap.get(emp.Department) || 0) + emp.Total_Salary);
    });
    return Array.from(deptMap.entries()).map(([name, value]) => ({ name, value }));
  }, [employees]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">Salary Insights</h1>
            <p className="text-muted-foreground mt-1">Upload and analyze employee salary data with AI-powered insights.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            <Button onClick={handleUploadClick} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
          </div>
        </header>

        {isProcessing && (
          <Card className="text-center p-12">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <CardTitle className="mt-4">Processing Data</CardTitle>
            <CardDescription>Analyzing salaries and detecting anomalies. Please wait.</CardDescription>
          </Card>
        )}

        {!isProcessing && employees.length === 0 && (
          <Card className="text-center p-12 border-dashed">
            <CardHeader>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <CardTitle className="mt-4">No Data</CardTitle>
              <CardDescription>Upload a CSV file to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {employees.length > 0 && !isProcessing && (
          <div className="grid gap-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center text-primary"><ShieldCheck className="mr-2 h-4 w-4" /> Parity Score</CardDescription>
                  <CardTitle className="text-2xl">{fairnessInsights?.parity_score.toFixed(1)}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{fairnessInsights?.recommendation}</p>
                </CardContent>
              </Card>
              <Card className={driftInsights?.drift_detected ? "bg-destructive/5 border-destructive/20" : "bg-secondary/5 border-secondary/20"}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center"><Activity className="mr-2 h-4 w-4" /> System Drift</CardDescription>
                  <CardTitle className="text-2xl">{driftInsights?.drift_detected ? "Detected" : "Stable"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{driftInsights?.status}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Employees</CardDescription>
                  <CardTitle className="text-2xl">{employees.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Anomalies Detected</CardDescription>
                  <CardTitle className="text-2xl text-destructive">{employees.filter(e => e.Anomaly_Label === 'Anomaly').length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Employee Salary Data
                </CardTitle>
                <CardDescription>{fileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeDataTable data={employees} />
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5" />Department Salary Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DepartmentPieChart data={departmentData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5" />Predicted vs. Actual Salary</CardTitle>
                  <CardDescription>Comparison for the first 10 employees.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalaryComparisonChart data={employees.slice(0, 10)} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
