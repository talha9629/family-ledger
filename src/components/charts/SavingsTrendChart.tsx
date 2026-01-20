import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/data/currencies';
import { subMonths, startOfMonth, endOfMonth, format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface SavingsTrendChartProps {
  period?: 'weekly' | 'monthly' | 'yearly';
}

export const SavingsTrendChart = ({ period = 'monthly' }: SavingsTrendChartProps) => {
  const { transactions, defaultCurrency } = useFinance();

  const data = useMemo(() => {
    const now = new Date();
    const dataPoints: { label: string; savings: number; monthly: number }[] = [];
    let cumulativeSavings = 0;
    
    if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekDate = subWeeks(now, i);
        const weekStart = startOfWeek(weekDate);
        const weekEnd = endOfWeek(weekDate);
        
        const weekSavings = transactions
          .filter(t => {
            const date = new Date(t.date);
            return t.type === 'savings' && date >= weekStart && date <= weekEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        cumulativeSavings += weekSavings;

        dataPoints.push({
          label: `Week ${4 - i}`,
          savings: cumulativeSavings,
          monthly: weekSavings,
        });
      }
    } else if (period === 'yearly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthSavings = transactions
          .filter(t => {
            const date = new Date(t.date);
            return t.type === 'savings' && date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        cumulativeSavings += monthSavings;

        dataPoints.push({
          label: format(monthDate, 'MMM'),
          savings: cumulativeSavings,
          monthly: monthSavings,
        });
      }
    } else {
      // Monthly - last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthSavings = transactions
          .filter(t => {
            const date = new Date(t.date);
            return t.type === 'savings' && date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        cumulativeSavings += monthSavings;

        dataPoints.push({
          label: format(monthDate, 'MMM'),
          savings: cumulativeSavings,
          monthly: monthSavings,
        });
      }
    }
    
    return dataPoints;
  }, [transactions, period]);

  const hasData = data.some(d => d.savings > 0);

  if (!hasData) {
    return (
      <div className="chart-container">
        <h3 className="font-semibold mb-4">Savings Trend</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          No savings data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="font-semibold mb-4">Savings Trend</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210 85% 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(210 85% 55%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value, defaultCurrency),
                name === 'savings' ? 'Total Savings' : 'This Period'
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="savings" 
              stroke="hsl(210 85% 55%)" 
              fill="url(#savingsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
