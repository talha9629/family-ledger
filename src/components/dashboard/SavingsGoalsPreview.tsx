import { ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/data/currencies';
import { Progress } from '@/components/ui/progress';

export const SavingsGoalsPreview = () => {
  const navigate = useNavigate();
  const { savingsGoals, defaultCurrency } = useFinance();

  const activeGoals = savingsGoals.slice(0, 3);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Savings Goals</h3>
        <button 
          onClick={() => navigate('/goals')}
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {activeGoals.length > 0 ? (
          activeGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div 
                key={goal.id}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Target className="h-5 w-5" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{goal.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(goal.currentAmount, goal.currency)} of {formatCurrency(goal.targetAmount, goal.currency)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 bg-card rounded-2xl shadow-card">
            <Target className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No savings goals yet</p>
            <button 
              onClick={() => navigate('/add/goal')}
              className="text-xs text-primary font-medium mt-1"
            >
              Create your first goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
