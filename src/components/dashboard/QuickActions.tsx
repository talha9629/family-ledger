import { Plus, TrendingUp, TrendingDown, PiggyBank, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { icon: TrendingUp, label: 'Income', path: '/add/income', color: 'bg-income-soft text-income' },
  { icon: TrendingDown, label: 'Expense', path: '/add/expense', color: 'bg-expense-soft text-expense' },
  { icon: PiggyBank, label: 'Savings', path: '/add/savings', color: 'bg-savings-soft text-savings' },
  { icon: Users, label: 'Loan', path: '/add/loan', color: 'bg-loan-soft text-loan' },
  { icon: FileText, label: 'Committee', path: '/add/committee', color: 'bg-committee-soft text-committee' },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {actions.map(({ icon: Icon, label, path, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 min-w-[70px]"
          >
            <div className={`p-3 rounded-2xl ${color} transition-transform active:scale-95`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
