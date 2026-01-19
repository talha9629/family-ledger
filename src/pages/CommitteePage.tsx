import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/data/currencies';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Users, Plus, Calendar, CheckCircle2, Circle, 
  TrendingUp, Clock, Crown, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Committee } from '@/types/finance';

export const CommitteePage = () => {
  const navigate = useNavigate();
  const { committees, defaultCurrency } = useFinance();

  const activeCommittees = committees.filter(c => c.status === 'active');
  const upcomingCommittees = committees.filter(c => c.status === 'upcoming');
  const completedCommittees = committees.filter(c => c.status === 'completed');

  const summary = useMemo(() => {
    const monthlyContribution = activeCommittees.reduce((sum, c) => sum + c.monthlyAmount, 0);
    const totalInvested = activeCommittees.reduce((sum, c) => sum + c.payments.reduce((s, p) => s + p.amount, 0), 0);
    const expectedPayout = activeCommittees.reduce((sum, c) => sum + (c.totalMembers * c.monthlyAmount), 0);
    
    return { monthlyContribution, totalInvested, expectedPayout };
  }, [activeCommittees]);

  const CommitteeCard = ({ committee }: { committee: Committee }) => {
    const totalPayout = committee.totalMembers * committee.monthlyAmount;
    const progress = (committee.currentMonth / committee.totalMembers) * 100;
    const monthsUntilPayout = committee.myPayoutMonth - committee.currentMonth;
    const payoutDate = addMonths(new Date(committee.startDate), committee.myPayoutMonth - 1);
    
    const isPastPayout = committee.currentMonth >= committee.myPayoutMonth;
    
    return (
      <div 
        className="bg-card rounded-2xl p-4 shadow-card cursor-pointer"
        onClick={() => navigate(`/committee/${committee.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-committee-soft">
              <Users className="h-5 w-5 text-committee" />
            </div>
            <div>
              <h4 className="font-semibold">{committee.name}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {committee.organizer || 'Unknown Organizer'}
              </p>
            </div>
          </div>
          <Badge variant={
            committee.status === 'active' ? 'default' : 
            committee.status === 'upcoming' ? 'secondary' : 
            'outline'
          }>
            {committee.status}
          </Badge>
        </div>

        {/* Monthly amount & total */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="font-semibold">{formatCurrency(committee.monthlyAmount, committee.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Payout</p>
            <p className="font-semibold text-committee">{formatCurrency(totalPayout, committee.currency)}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">Month {committee.currentMonth} of {committee.totalMembers}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Payout info */}
        <div className={cn(
          'flex items-center gap-2 p-2 rounded-lg text-xs',
          isPastPayout 
            ? committee.hasReceivedPayout 
              ? 'bg-income-soft text-income' 
              : 'bg-accent-soft text-accent'
            : 'bg-muted'
        )}>
          {isPastPayout ? (
            committee.hasReceivedPayout ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Payout received in month {committee.myPayoutMonth}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Payout was due in month {committee.myPayoutMonth}</span>
              </>
            )
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Your payout: Month {committee.myPayoutMonth} ({monthsUntilPayout} months away)
              </span>
            </>
          )}
        </div>

        {/* Payment timeline */}
        <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-hide">
          {Array.from({ length: committee.totalMembers }, (_, i) => i + 1).map(month => {
            const isPaid = committee.payments.some(p => p.month === month);
            const isMyPayout = month === committee.myPayoutMonth;
            const isCurrent = month === committee.currentMonth;
            
            return (
              <div 
                key={month}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 border-2',
                  isPaid && 'bg-committee text-committee-foreground border-committee',
                  !isPaid && month <= committee.currentMonth && 'bg-destructive text-destructive-foreground border-destructive',
                  !isPaid && month > committee.currentMonth && 'bg-muted border-muted',
                  isMyPayout && 'ring-2 ring-primary ring-offset-1'
                )}
              >
                {month}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Committees"
        subtitle={`${activeCommittees.length} active`}
        rightAction={
          <Button size="sm" onClick={() => navigate('/add/committee')}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        }
      />

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="stat-card stat-card-committee">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Monthly Contribution</p>
            <TrendingUp className="h-5 w-5 opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(summary.monthlyContribution, defaultCurrency)}</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span>Invested: {formatCurrency(summary.totalInvested, defaultCurrency)}</span>
            <span>Expected: {formatCurrency(summary.expectedPayout, defaultCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="px-4 mb-4">
        <div className="bg-primary-soft rounded-xl p-3 flex gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">What is a Committee?</p>
            <p className="text-xs text-muted-foreground">
              A rotating savings club where members contribute monthly. Each month, one member gets the full pool. It's interest-free saving!
            </p>
          </div>
        </div>
      </div>

      {/* Committee List */}
      <div className="px-4 space-y-3">
        {activeCommittees.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground">Active</h3>
            {activeCommittees.map(committee => (
              <CommitteeCard key={committee.id} committee={committee} />
            ))}
          </>
        )}

        {upcomingCommittees.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground mt-6">Upcoming</h3>
            {upcomingCommittees.map(committee => (
              <CommitteeCard key={committee.id} committee={committee} />
            ))}
          </>
        )}

        {completedCommittees.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground mt-6">Completed</h3>
            {completedCommittees.map(committee => (
              <CommitteeCard key={committee.id} committee={committee} />
            ))}
          </>
        )}

        {committees.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No committees yet</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => navigate('/add/committee')}
            >
              Add your first committee
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
