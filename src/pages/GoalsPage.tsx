import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/data/currencies';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Target, Trash2, Edit2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import * as Icons from 'lucide-react';

export const GoalsPage = () => {
  const navigate = useNavigate();
  const { savingsGoals, deleteSavingsGoal, defaultCurrency } = useFinance();

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Savings Goals" 
        showBack
        rightAction={
          <Button size="sm" onClick={() => navigate('/add/goal')}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {savingsGoals.length > 0 ? (
          savingsGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const IconComponent = (Icons as any)[goal.icon] || Target;
            const daysLeft = goal.deadline 
              ? differenceInDays(new Date(goal.deadline), new Date())
              : null;

            return (
              <div key={goal.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <IconComponent className="h-6 w-6" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{goal.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.currentAmount, goal.currency)} of {formatCurrency(goal.targetAmount, goal.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => deleteSavingsGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold" style={{ color: goal.color }}>
                      {progress.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(remaining, goal.currency)} to go
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-3"
                    style={{ 
                      ['--progress-color' as any]: goal.color 
                    }}
                  />
                </div>

                {goal.deadline && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Target: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="ml-1">({daysLeft} days left)</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Quick add savings */}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate(`/add/savings?goalId=${goal.id}`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Savings
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No savings goals yet</p>
            <p className="text-xs mt-1">Create goals to track your progress</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/add/goal')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
