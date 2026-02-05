"use client";
import React from 'react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { Employee } from "@/types";

const chartConfig = {
  Total_Salary: {
    label: "Actual Salary",
    color: "hsl(var(--chart-1))",
  },
  Predicted_Salary: {
    label: "Predicted Salary",
    color: "hsl(var(--chart-2))",
  },
  Confidence_Range: {
    label: "90% Confidence Range",
    color: "hsl(var(--muted-foreground))",
  }
};

export function SalaryComparisonChart({ data }: { data: Employee[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-80 text-muted-foreground">No data to display</div>;
  }

  return (
    <div className="w-full h-80">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <XAxis
            dataKey="Name"
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${value / 1000}k`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel /> as any}
          />
          <Bar dataKey="Total_Salary" fill="var(--color-Total_Salary)" radius={4} />
          <Bar dataKey="Predicted_Salary" fill="var(--color-Predicted_Salary)" radius={4} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}
