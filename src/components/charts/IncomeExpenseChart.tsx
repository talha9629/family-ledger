import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/data/currencies';
import { subMonths, startOfMonth, endOfMonth, format, subWeeks, startOfWeek, endOfWeek, startOfYear } from 'date-fns';

interface IncomeExpenseChartProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export const IncomeExpenseChart = ({ period = 'monthly' }: IncomeExpenseChartProps) => {
  const { transactions, defaultCurrency } = useFinance();

  const data = useMemo(() => {
    const now = new Date();
    const dataPoints: { label: string; income: number; expenses: number }[] = [];
    
    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);
        
        const dayTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= dayStart && date <= dayEnd;
        });

        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        dataPoints.push({
          label: format(dayDate, 'EEE'),
          income,
          expenses,
        });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekDate = subWeeks(now, i);
        const weekStart = startOfWeek(weekDate);
        const weekEnd = endOfWeek(weekDate);
        
        const weekTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= weekStart && date <= weekEnd;
        });

        const income = weekTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = weekTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        dataPoints.push({
          label: `Week ${4 - i}`,
          income,
          expenses,
        });
      }
    } else if (period === 'yearly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        dataPoints.push({
          label: format(monthDate, 'MMM'),
          income,
          expenses,
        });
      }
    } else {
      // Monthly - last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        dataPoints.push({
          label: format(monthDate, 'MMM'),
          income,
          expenses,
        });
      }
    }
    
    return dataPoints;
  }, [transactions, period]);

  const hasData = data.some(d => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="chart-container">
        <h3 className="font-semibold mb-4">Income vs Expenses</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="font-semibold mb-4">Income vs Expenses</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              formatter={(value: number) => formatCurrency(value, defaultCurrency)}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="income" name="Income" fill="hsl(145 65% 42%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="hsl(0 75% 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
