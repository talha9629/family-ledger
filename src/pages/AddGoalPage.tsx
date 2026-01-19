import { PageHeader } from '@/components/layout/PageHeader';
import { SavingsGoalForm } from '@/components/forms/SavingsGoalForm';

export const AddGoalPage = () => {
  return (
    <div className="page-enter">
      <PageHeader title="Create Savings Goal" showBack />
      <SavingsGoalForm />
    </div>
  );
};
