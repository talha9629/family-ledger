import { PageHeader } from '@/components/layout/PageHeader';
import { TransferForm } from '@/components/forms/TransferForm';

export const TransferPage = () => {
  return (
    <div className="page-enter">
      <PageHeader title="Transfer Between Accounts" showBack />
      <TransferForm />
    </div>
  );
};
