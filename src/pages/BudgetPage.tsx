import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { getCategoriesByType, getCategoryById } from '@/data/categories';
import { currencies, formatCurrency } from '@/data/currencies';
import { CurrencyCode, Budget } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Wallet, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, parseISO, isWithinInterval } from 'date-fns';

export const BudgetPage = () => {
  const navigate = useNavigate();
  const { budgets, transactions, defaultCurrency, addBudget, updateBudget, deleteBudget } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  const expenseCategories = getCategoriesByType('expense');

  // Calculate spending per budget
  const budgetStatus = useMemo(() => {
    const now = new Date();
    
    return budgets.map(budget => {
      let dateRange: { start: Date; end: Date };
      
      switch (budget.period) {
        case 'weekly':
          dateRange = { start: startOfWeek(now), end: endOfWeek(now) };
          break;
        case 'yearly':
          dateRange = { start: startOfYear(now), end: endOfYear(now) };
          break;
        case 'monthly':
        default:
          dateRange = { start: startOfMonth(now), end: endOfMonth(now) };
      }

      const spent = transactions
        .filter(t => {
          if (t.type !== 'expense' || t.category !== budget.categoryId) return false;
          const txDate = parseISO(t.date);
          return isWithinInterval(txDate, dateRange);
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;
      const isOverBudget = spent > budget.amount;
      const isNearLimit = percentage >= 80 && !isOverBudget;

      return {
        budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget,
        isNearLimit,
      };
    });
  }, [budgets, transactions]);

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setPeriod('monthly');
    setCurrency(defaultCurrency);
    setEditingBudget(null);
  };

  const handleSave = () => {
    if (!categoryId || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.categoryId === categoryId && b.period === period);
    if (existingBudget && !editingBudget) {
      toast.error('A budget already exists for this category and period');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId,
        amount: parseFloat(amount),
        currency,
        period,
      });
      toast.success('Budget updated!');
    } else {
      addBudget({
        categoryId,
        amount: parseFloat(amount),
        currency,
        period,
      });
      toast.success('Budget created!');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setCategoryId(budget.categoryId);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setCurrency(budget.currency);
    setDialogOpen(true);
  };

  const handleDelete = (budgetId: string) => {
    deleteBudget(budgetId);
    toast.success('Budget deleted');
  };

  // Get categories that don't have a budget yet
  const availableCategories = expenseCategories.filter(
    cat => !budgets.some(b => b.categoryId === cat.id && b.period === period) || (editingBudget?.categoryId === cat.id)
  );

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Budget Tracker" 
        showBack
        rightAction={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(cat => {
                        const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget Amount</Label>
                  <div className="flex gap-2">
                    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} className="w-full">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 space-y-4">
        {/* Summary */}
        {budgetStatus.length > 0 && (
          <div className="stat-card stat-card-expense">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Budget Overview</p>
              <Wallet className="h-5 w-5 opacity-75" />
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="opacity-75">On Track: </span>
                <span className="font-bold">
                  {budgetStatus.filter(b => !b.isOverBudget && !b.isNearLimit).length}
                </span>
              </div>
              <div>
                <span className="opacity-75">Near Limit: </span>
                <span className="font-bold">
                  {budgetStatus.filter(b => b.isNearLimit).length}
                </span>
              </div>
              <div>
                <span className="opacity-75">Over: </span>
                <span className="font-bold">
                  {budgetStatus.filter(b => b.isOverBudget).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Budget List */}
        {budgetStatus.length > 0 ? (
          <div className="space-y-3">
            {budgetStatus.map(({ budget, spent, remaining, percentage, isOverBudget, isNearLimit }) => {
              const category = getCategoryById(budget.categoryId);
              const IconComponent = category ? (Icons as any)[category.icon] || Icons.HelpCircle : Icons.HelpCircle;
              
              return (
                <div 
                  key={budget.id} 
                  className="bg-card rounded-2xl p-4 shadow-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: category?.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category?.name || 'Unknown'}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <div className="flex items-center gap-1 text-destructive text-xs">
                          <AlertCircle className="h-4 w-4" />
                          Over
                        </div>
                      )}
                      {isNearLimit && !isOverBudget && (
                        <div className="flex items-center gap-1 text-accent text-xs">
                          <AlertCircle className="h-4 w-4" />
                          Near limit
                        </div>
                      )}
                      {!isOverBudget && !isNearLimit && (
                        <div className="flex items-center gap-1 text-income text-xs">
                          <CheckCircle2 className="h-4 w-4" />
                          On track
                        </div>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the budget limit for {category?.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(budget.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {formatCurrency(spent, budget.currency)} spent
                      </span>
                      <span className="font-medium">
                        {formatCurrency(budget.amount, budget.currency)}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        'h-2',
                        isOverBudget && '[&>div]:bg-destructive',
                        isNearLimit && '[&>div]:bg-accent'
                      )} 
                    />
                  </div>

                  <p className={cn(
                    'text-sm font-medium',
                    isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {isOverBudget 
                      ? `${formatCurrency(Math.abs(remaining), budget.currency)} over budget`
                      : `${formatCurrency(remaining, budget.currency)} remaining`
                    }
                  </p>

                  {/* Edit button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => handleEdit(budget)}
                  >
                    Edit Budget
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No budgets set</p>
            <p className="text-xs mt-1">Set spending limits for your categories</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setDialogOpen(true)}
            >
              Create your first budget
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
