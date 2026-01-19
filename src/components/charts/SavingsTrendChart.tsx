import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/data/currencies';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const SavingsTrendChart = () => {
  const { transactions, defaultCurrency } = useFinance();

  const data = useMemo(() => {
    const months = [];
    const now = new Date();
    let cumulativeSavings = 0;
    
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

      months.push({
        month: format(monthDate, 'MMM'),
        savings: cumulativeSavings,
        monthly: monthSavings,
      });
    }
    
    return months;
  }, [transactions]);

  return (
    <div className="chart-container">
      <h3 className="font-semibold mb-4">Savings Trend</h3>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--savings))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--savings))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value, defaultCurrency),
                name === 'savings' ? 'Total Savings' : 'Monthly'
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
              stroke="hsl(var(--savings))" 
              strokeWidth={2}
              fill="url(#savingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
