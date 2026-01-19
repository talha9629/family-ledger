import { PageHeader } from '@/components/layout/PageHeader';
import { CommitteeForm } from '@/components/forms/CommitteeForm';

export const AddCommitteePage = () => {
  return (
    <div className="page-enter">
      <PageHeader title="Add Committee" showBack />
      <CommitteeForm />
    </div>
  );
};
