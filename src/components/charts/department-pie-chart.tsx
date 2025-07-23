"use client";

import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DepartmentData {
  name: string;
  value: number;
}

const chartConfig = {
  value: {
    label: "Salary",
  },
};

const COLORS = ["#4F46E5", "#10B981", "#3B82F6", "#F97316", "#EC4899", "#8B5CF6"];

export function DepartmentPieChart({ data }: { data: DepartmentData[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data to display</div>;
  }
  
  const totalValue = data.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <div className="w-full h-64">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <RechartsPieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="name" />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              index,
            }) => {
              const RADIAN = Math.PI / 180
              const radius = 12 + innerRadius + (outerRadius - innerRadius)
              const x = cx + radius * Math.cos(-midAngle * RADIAN)
              const y = cy + radius * Math.sin(-midAngle * RADIAN)
              
              if ((value / totalValue) * 100 < 5) return null;

              return (
                <text
                  x={x}
                  y={y}
                  className="fill-muted-foreground text-xs"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                >
                  {data[index].name} (
                  {new Intl.NumberFormat("en-US", {
                    style: "percent",
                    maximumFractionDigits: 0,
                  }).format(value / totalValue)}
                  )
                </text>
              )
            }}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
