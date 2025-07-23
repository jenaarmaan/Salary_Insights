// This file predicts salary based on Base Salary, Bonus, and Deductions using a linear regression model.
// It exports the predictSalary function, PredictSalaryInput type, and PredictSalaryOutput type.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSalaryInputSchema = z.array(
  z.object({
    Emp_ID: z.string(),
    Base_Salary: z.number().describe('The base salary of the employee.'),
    Bonus: z.number().describe('The bonus amount for the employee.'),
    Deductions: z.number().describe('The deductions amount for the employee.'),
  })
);

export type PredictSalaryInput = z.infer<typeof PredictSalaryInputSchema>;

const PredictSalaryOutputSchema = z.array(
  z.object({
    Emp_ID: z.string(),
    Predicted_Salary: z
      .number()
      .describe('The predicted total salary of the employee.'),
  })
);

export type PredictSalaryOutput = z.infer<typeof PredictSalaryOutputSchema>;

export async function predictSalary(input: PredictSalaryInput): Promise<PredictSalaryOutput> {
  return predictSalaryFlow(input);
}

const predictSalaryPrompt = ai.definePrompt({
  name: 'predictSalaryPrompt',
  input: {schema: PredictSalaryInputSchema},
  output: {schema: PredictSalaryOutputSchema},
  prompt: `For each employee in the provided data, predict the total salary based on their base salary, bonus, and deductions. Return an array of objects, each containing the employee's Emp_ID and their predicted salary.

Employee Data:
{{#each this}}
- Emp_ID: {{Emp_ID}}, Base Salary: {{Base_Salary}}, Bonus: {{Bonus}}, Deductions: {{Deductions}}
{{/each}}
`,
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
