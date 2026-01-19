import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { TransactionType } from '@/types/finance';

export const AddTransactionPage = () => {
  const { type } = useParams<{ type: string }>();
  
  const transactionType = (type as TransactionType) || 'expense';
  
  const titles = {
    income: 'Add Income',
    expense: 'Add Expense',
    savings: 'Add Savings',
  };

  return (
    <div className="page-enter">
      <PageHeader title={titles[transactionType]} showBack />
      <TransactionForm type={transactionType} />
    </div>
  );
};
