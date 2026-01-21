import { Transaction } from '@/types/finance';
import { getCategoryById } from '@/data/categories';
import { formatCurrency } from '@/data/currencies';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Image } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionItem = ({ transaction, onClick }: TransactionItemProps) => {
  const category = getCategoryById(transaction.category);
  const IconComponent = category ? (Icons as any)[category.icon] || Icons.HelpCircle : Icons.HelpCircle;
  
  const isIncome = transaction.type === 'income';
  const isSavings = transaction.type === 'savings';

  return (
    <div 
      className="transaction-item group"
      onClick={onClick}
    >
      <div 
        className="p-3 rounded-xl transition-transform group-hover:scale-105"
        style={{ 
          backgroundColor: category ? `${category.color}15` : 'hsl(var(--muted))',
        }}
      >
        <IconComponent 
          className="h-5 w-5" 
          style={{ color: category?.color || 'currentColor' }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">
            {category?.name || 'Unknown'}
          </h4>
          {transaction.attachmentUrl && (
            <Image className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {transaction.description}
        </p>
      </div>
      
      <div className="text-right">
        <p className={cn(
          'font-bold text-sm',
          isIncome && 'text-income',
          !isIncome && !isSavings && 'text-expense',
          isSavings && 'text-savings'
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {format(new Date(transaction.date), 'MMM d')}
        </p>
      </div>
    </div>
  );
};
