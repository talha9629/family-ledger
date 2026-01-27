import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, PiggyBank, Users, FileText, ArrowLeftRight, X } from 'lucide-react';

const actions = [
  { icon: TrendingUp, label: 'Income', path: '/add/income', color: 'bg-income' },
  { icon: TrendingDown, label: 'Expense', path: '/add/expense', color: 'bg-expense' },
  { icon: PiggyBank, label: 'Savings', path: '/add/savings', color: 'bg-savings' },
  { icon: ArrowLeftRight, label: 'Transfer', path: '/transfer', color: 'bg-primary' },
  { icon: Users, label: 'Loan', path: '/add/loan', color: 'bg-loan' },
  { icon: FileText, label: 'Committee', path: '/add/committee', color: 'bg-committee' },
];

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Action buttons */}
      <div className={cn(
        'fixed bottom-28 right-4 z-40 flex flex-col-reverse gap-3 transition-all duration-300',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        {actions.map(({ icon: Icon, label, path, color }, index) => (
          <button
            key={label}
            onClick={() => handleAction(path)}
            className={cn(
              'flex items-center gap-3 transition-all duration-200',
              isOpen ? 'animate-slide-up' : ''
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="bg-card px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
              {label}
            </span>
            <div className={cn('p-3 rounded-full text-white shadow-float', color)}>
              <Icon className="h-5 w-5" />
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fab',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </>
  );
};
