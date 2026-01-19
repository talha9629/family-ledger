import { PageHeader } from '@/components/layout/PageHeader';
import { LoanForm } from '@/components/forms/LoanForm';

export const AddLoanPage = () => {
  return (
    <div className="page-enter">
      <PageHeader title="Add Loan" showBack />
      <LoanForm />
    </div>
  );
};
