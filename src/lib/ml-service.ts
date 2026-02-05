import type { Employee, AnalysisResults } from '@/types';

const ML_SERVICE_URL = (globalThis as any).process?.env?.ML_SERVICE_URL || 'http://localhost:8000';

export async function analyzeSalaries(employees: Partial<Employee>[]): Promise<AnalysisResults> {
    const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employees),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze salaries via ML Service');
    }

    return response.json();
}
