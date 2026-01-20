import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { currencies, formatCurrency } from '@/data/currencies';
import { CurrencyCode, LoanType } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Trash2, Save, Plus, HandCoins, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const LoanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loans, updateLoan, deleteLoan, addLoanPayment, defaultCurrency } = useFinance();
  
  const loan = loans.find(l => l.id === id);
  
  const [personName, setPersonName] = useState(loan?.personName || '');
  const [amount, setAmount] = useState(loan?.amount.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(loan?.currency || defaultCurrency);
  const [type, setType] = useState<LoanType>(loan?.type || 'given');
  const [date, setDate] = useState<Date | undefined>(
    loan?.date ? parseISO(loan.date) : new Date()
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    loan?.dueDate ? parseISO(loan.dueDate) : undefined
  );
  const [reason, setReason] = useState(loan?.reason || '');

  // Payment dialog state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (loan) {
      setPersonName(loan.personName);
      setAmount(loan.amount.toString());
      setCurrency(loan.currency);
      setType(loan.type);
      setDate(parseISO(loan.date));
      setDueDate(loan.dueDate ? parseISO(loan.dueDate) : undefined);
      setReason(loan.reason || '');
    }
  }, [loan]);

  if (!loan) {
    return (
      <div className="page-enter pb-6">
        <PageHeader title="Loan Not Found" showBack />
        <div className="px-4 text-center py-12">
          <p className="text-muted-foreground">This loan doesn't exist.</p>
          <Button variant="link" onClick={() => navigate('/loans')}>
            Go back to loans
          </Button>
        </div>
      </div>
    );
  }

  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = loan.amount - totalPaid;
  const progress = (totalPaid / loan.amount) * 100;

  const handleSave = () => {
    if (!personName || !amount || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateLoan(loan.id, {
      personName,
      amount: parseFloat(amount),
      currency,
      type,
      date: date.toISOString().split('T')[0],
      dueDate: dueDate?.toISOString().split('T')[0],
      reason,
    });

    toast.success('Loan updated!');
    navigate('/loans');
  };

  const handleDelete = () => {
    deleteLoan(loan.id);
    toast.success('Loan deleted');
    navigate('/loans');
  };

  const handleAddPayment = () => {
    if (!paymentAmount || !paymentDate) {
      toast.error('Please enter payment amount and date');
      return;
    }

    addLoanPayment(
      loan.id, 
      parseFloat(paymentAmount), 
      paymentDate.toISOString().split('T')[0],
      paymentNote || undefined
    );

    toast.success('Payment recorded!');
    setPaymentOpen(false);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const handleMarkSettled = () => {
    updateLoan(loan.id, { isSettled: true });
    toast.success('Loan marked as settled!');
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Loan Details" 
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
                <AlertDialogTitle>Delete Loan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this loan and all payment history.
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
        <div className={cn(
          'stat-card',
          type === 'given' ? 'stat-card-income' : 'stat-card-expense'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {type === 'given' ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownLeft className="h-5 w-5" />
              )}
              <span className="font-semibold">
                {type === 'given' ? 'Lent to' : 'Borrowed from'} {loan.personName}
              </span>
            </div>
            <Badge variant={loan.isSettled ? 'outline' : 'default'}>
              {loan.isSettled ? 'Settled' : 'Active'}
            </Badge>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-80">Repayment Progress</span>
              <span>{formatCurrency(totalPaid, loan.currency)} / {formatCurrency(loan.amount, loan.currency)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Remaining</span>
            <span className="font-bold">{formatCurrency(remaining, loan.currency)}</span>
          </div>
        </div>

        {/* Add Payment Button */}
        {!loan.isSettled && (
          <div className="flex gap-2">
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-muted rounded-md text-sm">
                        {currencies.find(c => c.code === loan.currency)?.symbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {paymentDate ? format(paymentDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={paymentDate}
                          onSelect={setPaymentDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Input
                      placeholder="Payment via bank transfer..."
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full">
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {remaining <= 0 && (
              <Button variant="outline" onClick={handleMarkSettled}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Settled
              </Button>
            )}
          </div>
        )}

        {/* Payment History */}
        {loan.payments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Payment History</h3>
            <div className="space-y-2">
              {loan.payments.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card">
                  <div>
                    <p className="font-medium text-sm">
                      {formatCurrency(payment.amount, loan.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(payment.date), 'MMM d, yyyy')}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-muted-foreground mt-1">{payment.note}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">Edit Loan</h3>
          
          {/* Type */}
          <div className="space-y-2">
            <Label>Loan Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('given')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  type === 'given'
                    ? 'border-income bg-income/5'
                    : 'border-transparent bg-muted/50'
                )}
              >
                <ArrowUpRight className={cn('h-5 w-5', type === 'given' ? 'text-income' : 'text-muted-foreground')} />
                <span className="font-medium">I Lent</span>
              </button>
              <button
                type="button"
                onClick={() => setType('taken')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  type === 'taken'
                    ? 'border-expense bg-expense/5'
                    : 'border-transparent bg-muted/50'
                )}
              >
                <ArrowDownLeft className={cn('h-5 w-5', type === 'taken' ? 'text-expense' : 'text-muted-foreground')} />
                <span className="font-medium">I Borrowed</span>
              </button>
            </div>
          </div>

          {/* Person Name */}
          <div className="space-y-2">
            <Label>Person Name</Label>
            <Input
              placeholder="Who?"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
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

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'No due date set'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="What was this loan for?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
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
