"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  workspaces: {
    label: "Workspaces",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const chartData = [
  { month: "January", workspaces: 186 },
  { month: "February", workspaces: 305 },
  { month: "March", workspaces: 237 },
  { month: "April", workspaces: 73 },
  { month: "May", workspaces: 209 },
  { month: "June", workspaces: 214 },
]

export default function WorkspaceGrowthChart({ data }: { data: any }) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="workspaces" fill="var(--color-workspaces)" radius={8}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
