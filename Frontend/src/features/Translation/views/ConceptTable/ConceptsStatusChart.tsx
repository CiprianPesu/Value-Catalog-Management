'use client';

import { RadialBarChart, RadialBar, Tooltip as ChartTooltip } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { colors } from '@/lib/utils';

const chartConfig = {
  valoare: {
    label: 'Concepte',
  },
  total: {
    label: 'Total',
  },
  translated: {
    label: 'Traduse',
  },
  validated: {
    label: 'Validate',
  },
} satisfies ChartConfig;

type ConceptsStatusChartProps = {
  total: number;
  translated: number;
  validated: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
};

const ConceptsStatusChart = ({ total, translated, validated, className }: ConceptsStatusChartProps) => {
  return (
    <ChartContainer config={chartConfig} className={`mx-auto w-full  min-h-[250px] aspect-square ${className ?? ''}`}>
      <RadialBarChart
        data={[
          { nume: 'total', valoare: total, fill: colors.gray_light, value: 'total' },
          { nume: 'translated', valoare: translated, fill: colors.orange_cnas, value: 'translated' },
          { nume: 'validated', valoare: validated, fill: colors.blue_cnas, value: 'validated' },
        ]}
        innerRadius={30}
        outerRadius={100}
      >
        <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey='valoare' nameKey='nume' />} />
        <ChartLegend content={<ChartLegendContent nameKey='nume' />} />
        <RadialBar dataKey='valoare' background cornerRadius={5} />
      </RadialBarChart>
    </ChartContainer>
  );
};

export default ConceptsStatusChart;
