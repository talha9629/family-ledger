import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { TransactionItem } from '@/components/transactions/TransactionItem';

export const RecentTransactions = () => {
  const navigate = useNavigate();
  const { transactions } = useFinance();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent Transactions</h3>
        <button 
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {recentTransactions.length > 0 ? (
          recentTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
