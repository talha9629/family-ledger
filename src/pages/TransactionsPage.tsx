import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionFilters } from '@/components/filters/TransactionFilters';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { TransactionFilter } from '@/types/finance';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { formatCurrency } from '@/data/currencies';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const { transactions, defaultCurrency } = useFinance();
  
  const now = new Date();
  const [filter, setFilter] = useState<TransactionFilter>({
    period: 'monthly',
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Date filter
      if (filter.startDate && filter.endDate) {
        const transactionDate = parseISO(t.date);
        const start = parseISO(filter.startDate);
        const end = parseISO(filter.endDate);
        end.setHours(23, 59, 59); // Include the entire end day
        
        if (!isWithinInterval(transactionDate, { start, end })) {
          return false;
        }
      }

      // Type filter
      if (filter.type && t.type !== filter.type) {
        return false;
      }

      // Category filter
      if (filter.categoryId && t.category !== filter.categoryId) {
        return false;
      }

      // Search filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    
    filteredTransactions.forEach(t => {
      const date = t.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(t);
    });

    return Object.entries(groups).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filteredTransactions]);

  // Summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses };
  }, [filteredTransactions]);

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Transactions"
        subtitle={`${filteredTransactions.length} transactions`}
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => navigate('/analytics')}>
            <BarChart2 className="h-5 w-5" />
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4">
        <TransactionFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {/* Summary */}
      <div className="flex gap-4 px-4 mb-4">
        <div className="flex-1 bg-income-soft rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="font-bold text-income">{formatCurrency(summary.income, defaultCurrency)}</p>
        </div>
        <div className="flex-1 bg-expense-soft rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="font-bold text-expense">{formatCurrency(summary.expenses, defaultCurrency)}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([date, txns]) => (
            <div key={date} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {txns.map(t => (
                  <TransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <FloatingActionButton />
    </div>
  );
};
