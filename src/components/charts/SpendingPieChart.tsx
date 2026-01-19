import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { getCategoryById } from '@/data/categories';
import { formatCurrency } from '@/data/currencies';

interface SpendingPieChartProps {
  period?: 'weekly' | 'monthly' | 'yearly';
}

export const SpendingPieChart = ({ period = 'monthly' }: SpendingPieChartProps) => {
  const { transactions, defaultCurrency } = useFinance();

  const data = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const expenses = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) >= startDate
    );

    const categoryTotals: Record<string, { amount: number; color: string; name: string }> = {};
    
    expenses.forEach(t => {
      const category = getCategoryById(t.category);
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = {
          amount: 0,
          color: category?.color || '#888',
          name: category?.name || 'Other',
        };
      }
      categoryTotals[t.category].amount += t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([key, value]) => ({
        name: value.name,
        value: value.amount,
        color: value.color,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, period]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="font-semibold mb-4">Spending by Category</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          No expense data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="font-semibold mb-4">Spending by Category</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value, defaultCurrency)}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate flex-1">{item.name}</span>
            <span className="font-medium text-muted-foreground">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
