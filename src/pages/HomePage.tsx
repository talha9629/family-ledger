import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SavingsGoalsPreview } from '@/components/dashboard/SavingsGoalsPreview';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { formatCurrency } from '@/data/currencies';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HomePage = () => {
  const navigate = useNavigate();
  const { transactions, defaultCurrency } = useFinance();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthTransactions = transactions.filter(t => 
      new Date(t.date) >= monthStart
    );

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = monthTransactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses - savings;

    return { income, expenses, savings, balance };
  }, [transactions]);

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Family Finance"
        subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
            <Settings className="h-5 w-5" />
          </Button>
        }
      />

      {/* Balance Overview */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <p className="text-sm font-medium opacity-90 relative">This Month's Balance</p>
          <h2 className="text-4xl font-bold mt-2 relative">
            {formatCurrency(stats.balance, defaultCurrency)}
          </h2>
          <p className="text-sm opacity-80 mt-3 relative">
            {stats.balance >= 0 ? '✨ Great job managing your finances!' : '⚠️ Your expenses exceed your income'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        <StatCard
          title="Income"
          amount={formatCurrency(stats.income, defaultCurrency)}
          icon={TrendingUp}
          variant="income"
        />
        <StatCard
          title="Expenses"
          amount={formatCurrency(stats.expenses, defaultCurrency)}
          icon={TrendingDown}
          variant="expense"
        />
        <StatCard
          title="Savings"
          amount={formatCurrency(stats.savings, defaultCurrency)}
          icon={PiggyBank}
          variant="savings"
          className="col-span-2"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Spending Chart */}
      <div className="px-4 mb-6">
        <SpendingPieChart period="monthly" />
      </div>

      {/* Savings Goals */}
      <div className="mb-6">
        <SavingsGoalsPreview />
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <RecentTransactions />
      </div>

      <FloatingActionButton />
    </div>
  );
};
