import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/data/currencies';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, ArrowDownLeft, ChevronRight, Plus, 
  CheckCircle, Clock, User, Calendar, Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loan } from '@/types/finance';

export const LoansPage = () => {
  const navigate = useNavigate();
  const { loans, defaultCurrency } = useFinance();
  const [tab, setTab] = useState<'all' | 'given' | 'taken'>('all');

  const filteredLoans = useMemo(() => {
    if (tab === 'all') return loans;
    return loans.filter(l => l.type === tab);
  }, [loans, tab]);

  const pendingLoans = filteredLoans.filter(l => !l.isSettled);
  const settledLoans = filteredLoans.filter(l => l.isSettled);

  const summary = useMemo(() => {
    const givenPending = loans
      .filter(l => l.type === 'given' && !l.isSettled)
      .reduce((sum, l) => sum + l.amount - l.payments.reduce((s, p) => s + p.amount, 0), 0);
    
    const takenPending = loans
      .filter(l => l.type === 'taken' && !l.isSettled)
      .reduce((sum, l) => sum + l.amount - l.payments.reduce((s, p) => s + p.amount, 0), 0);

    return { givenPending, takenPending };
  }, [loans]);

  const LoanCard = ({ loan }: { loan: Loan }) => {
    const remaining = loan.amount - loan.payments.reduce((s, p) => s + p.amount, 0);
    const progressPercent = ((loan.payments.reduce((s, p) => s + p.amount, 0) / loan.amount) * 100);
    
    return (
      <div 
        className="bg-card rounded-2xl p-4 shadow-card cursor-pointer"
        onClick={() => navigate(`/loan/${loan.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-xl',
              loan.type === 'given' ? 'bg-expense-soft' : 'bg-income-soft'
            )}>
              {loan.type === 'given' 
                ? <ArrowUpRight className="h-5 w-5 text-expense" />
                : <ArrowDownLeft className="h-5 w-5 text-income" />
              }
            </div>
            <div>
              <h4 className="font-semibold">{loan.personName}</h4>
              <p className="text-xs text-muted-foreground">
                {loan.type === 'given' ? 'You gave' : 'You took'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              'font-bold',
              loan.type === 'given' ? 'text-expense' : 'text-income'
            )}>
              {formatCurrency(loan.amount, loan.currency)}
            </p>
            {!loan.isSettled && remaining > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(remaining, loan.currency)} left
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!loan.isSettled && (
          <div className="mb-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  loan.type === 'given' ? 'bg-expense' : 'bg-income'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(loan.date), 'MMM d, yyyy')}
            </span>
            {loan.attachmentUrl && (
              <span className="flex items-center gap-1">
                <Image className="h-3.5 w-3.5" />
                Photo
              </span>
            )}
          </div>
          <Badge variant={loan.isSettled ? 'default' : 'secondary'}>
            {loan.isSettled ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Settled</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" /> Pending</>
            )}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Loans"
        subtitle={`${pendingLoans.length} pending`}
        rightAction={
          <Button size="sm" onClick={() => navigate('/add/loan')}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-4">
        <div className="stat-card stat-card-expense">
          <p className="text-sm opacity-90">To Receive</p>
          <p className="text-xl font-bold">{formatCurrency(summary.givenPending, defaultCurrency)}</p>
          <p className="text-xs opacity-75">Money you gave</p>
        </div>
        <div className="stat-card stat-card-income">
          <p className="text-sm opacity-90">To Pay</p>
          <p className="text-xl font-bold">{formatCurrency(summary.takenPending, defaultCurrency)}</p>
          <p className="text-xs opacity-75">Money you owe</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="given" className="flex-1">Given</TabsTrigger>
            <TabsTrigger value="taken" className="flex-1">Taken</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loan List */}
      <div className="px-4 space-y-3">
        {pendingLoans.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground">Pending</h3>
            {pendingLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </>
        )}

        {settledLoans.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground mt-6">Settled</h3>
            {settledLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </>
        )}

        {filteredLoans.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No loans yet</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => navigate('/add/loan')}
            >
              Add your first loan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
