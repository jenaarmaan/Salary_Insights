// This file predicts salary based on Base Salary, Bonus, and Deductions using a linear regression model.
// It exports the predictSalary function, PredictSalaryInput type, and PredictSalaryOutput type.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSalaryInputSchema = z.object({
  baseSalary: z.number().describe('The base salary of the employee.'),
  bonus: z.number().describe('The bonus amount for the employee.'),
  deductions: z.number().describe('The deductions amount for the employee.'),
});

export type PredictSalaryInput = z.infer<typeof PredictSalaryInputSchema>;

const PredictSalaryOutputSchema = z.object({
  predictedSalary: z
    .number()
    .describe('The predicted total salary of the employee.'),
});

export type PredictSalaryOutput = z.infer<typeof PredictSalaryOutputSchema>;

export async function predictSalary(input: PredictSalaryInput): Promise<PredictSalaryOutput> {
  return predictSalaryFlow(input);
}

const predictSalaryPrompt = ai.definePrompt({
  name: 'predictSalaryPrompt',
  input: {schema: PredictSalaryInputSchema},
  output: {schema: PredictSalaryOutputSchema},
  prompt: `Given the base salary, bonus, and deductions, predict the total salary.

Base Salary: {{baseSalary}}
Bonus: {{bonus}}
Deductions: {{deductions}}

Predicted Salary:`,
});

const predictSalaryFlow = ai.defineFlow(
  {
    name: 'predictSalaryFlow',
    inputSchema: PredictSalaryInputSchema,
    outputSchema: PredictSalaryOutputSchema,
  },
  async input => {
    const {output} = await predictSalaryPrompt(input);
    return output!;
  }
);
