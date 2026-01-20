import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { currencies, formatCurrency } from '@/data/currencies';
import { CurrencyCode, CommitteeStatus } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, addMonths } from 'date-fns';
import { CalendarIcon, Trash2, Save, Users, CheckCircle2, Circle, Plus, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const CommitteeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { committees, updateCommittee, deleteCommittee, addCommitteePayment, defaultCurrency } = useFinance();
  
  const committee = committees.find(c => c.id === id);
  
  const [name, setName] = useState(committee?.name || '');
  const [totalMembers, setTotalMembers] = useState(committee?.totalMembers.toString() || '');
  const [monthlyAmount, setMonthlyAmount] = useState(committee?.monthlyAmount.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(committee?.currency || defaultCurrency);
  const [startDate, setStartDate] = useState<Date | undefined>(
    committee?.startDate ? parseISO(committee.startDate) : new Date()
  );
  const [myPayoutMonth, setMyPayoutMonth] = useState(committee?.myPayoutMonth.toString() || '');
  const [currentMonth, setCurrentMonth] = useState(committee?.currentMonth.toString() || '');
  const [organizer, setOrganizer] = useState(committee?.organizer || '');
  const [status, setStatus] = useState<CommitteeStatus>(committee?.status || 'active');

  useEffect(() => {
    if (committee) {
      setName(committee.name);
      setTotalMembers(committee.totalMembers.toString());
      setMonthlyAmount(committee.monthlyAmount.toString());
      setCurrency(committee.currency);
      setStartDate(parseISO(committee.startDate));
      setMyPayoutMonth(committee.myPayoutMonth.toString());
      setCurrentMonth(committee.currentMonth.toString());
      setOrganizer(committee.organizer);
      setStatus(committee.status);
    }
  }, [committee]);

  if (!committee) {
    return (
      <div className="page-enter pb-6">
        <PageHeader title="Committee Not Found" showBack />
        <div className="px-4 text-center py-12">
          <p className="text-muted-foreground">This committee doesn't exist.</p>
          <Button variant="link" onClick={() => navigate('/committee')}>
            Go back to committees
          </Button>
        </div>
      </div>
    );
  }

  const totalPayout = parseInt(totalMembers) * parseFloat(monthlyAmount || '0');
  const progress = (committee.currentMonth / committee.totalMembers) * 100;

  const handleSave = () => {
    if (!name || !totalMembers || !monthlyAmount || !startDate || !myPayoutMonth) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateCommittee(committee.id, {
      name,
      totalMembers: parseInt(totalMembers),
      monthlyAmount: parseFloat(monthlyAmount),
      currency,
      startDate: startDate.toISOString().split('T')[0],
      myPayoutMonth: parseInt(myPayoutMonth),
      currentMonth: parseInt(currentMonth),
      organizer,
      status,
    });

    toast.success('Committee updated!');
    navigate('/committee');
  };

  const handleDelete = () => {
    deleteCommittee(committee.id);
    toast.success('Committee deleted');
    navigate('/committee');
  };

  const handlePayMonth = (month: number) => {
    const isPaid = committee.payments.some(p => p.month === month);
    if (!isPaid) {
      addCommitteePayment(committee.id, month, new Date().getFullYear(), committee.monthlyAmount);
      toast.success(`Month ${month} marked as paid!`);
    }
  };

  const handleMarkPayoutReceived = () => {
    updateCommittee(committee.id, { hasReceivedPayout: true });
    toast.success('Payout marked as received!');
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Committee Details" 
        showBack 
        rightAction={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Committee?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this committee and all payment history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <div className="px-4 space-y-6">
        {/* Summary Card */}
        <div className="stat-card stat-card-committee">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{committee.name}</span>
            </div>
            <Badge variant={
              status === 'active' ? 'default' : 
              status === 'upcoming' ? 'secondary' : 
              'outline'
            }>
              {status}
            </Badge>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-80">Progress</span>
              <span>Month {committee.currentMonth} of {committee.totalMembers}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Payout</span>
            <span className="font-bold">{formatCurrency(committee.totalMembers * committee.monthlyAmount, committee.currency)}</span>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="space-y-2">
          <Label>Payment Timeline (tap to mark as paid)</Label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: committee.totalMembers }, (_, i) => i + 1).map(month => {
              const isPaid = committee.payments.some(p => p.month === month);
              const isMyPayout = month === committee.myPayoutMonth;
              const isCurrent = month === committee.currentMonth;
              
              return (
                <button
                  key={month}
                  onClick={() => handlePayMonth(month)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 border-2 transition-all',
                    isPaid && 'bg-committee text-committee-foreground border-committee',
                    !isPaid && month <= committee.currentMonth && 'bg-destructive/20 text-destructive border-destructive',
                    !isPaid && month > committee.currentMonth && 'bg-muted border-muted hover:border-primary',
                    isMyPayout && 'ring-2 ring-primary ring-offset-2'
                  )}
                  disabled={isPaid}
                >
                  {isPaid ? <CheckCircle2 className="h-4 w-4" /> : month}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Your payout month is marked with a ring
          </p>
        </div>

        {/* Payout Action */}
        {committee.currentMonth >= committee.myPayoutMonth && !committee.hasReceivedPayout && (
          <Button onClick={handleMarkPayoutReceived} className="w-full" variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Payout as Received
          </Button>
        )}

        {/* Edit Form */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">Edit Committee</h3>
          
          {/* Name */}
          <div className="space-y-2">
            <Label>Committee Name</Label>
            <Input
              placeholder="e.g., Office Committee"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <Label>Organizer</Label>
            <Input
              placeholder="Who runs this committee?"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />
          </div>

          {/* Members & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Members</Label>
              <Input
                type="number"
                placeholder="10"
                value={totalMembers}
                onChange={(e) => setTotalMembers(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Amount</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="10000"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Payout & Current Month */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>My Payout Month</Label>
              <Select value={myPayoutMonth} onValueChange={setMyPayoutMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: parseInt(totalMembers) || 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Month {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Month</Label>
              <Select value={currentMonth} onValueChange={setCurrentMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: parseInt(totalMembers) || 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Month {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CommitteeStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full mt-6" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
