import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { LoanType, CurrencyCode } from '@/types/finance';
import { currencies } from '@/data/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const LoanForm = () => {
  const navigate = useNavigate();
  const { addLoan, defaultCurrency } = useFinance();
  
  const [loanType, setLoanType] = useState<LoanType>('given');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personName || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    addLoan({
      type: loanType,
      personName,
      amount: parseFloat(amount),
      currency,
      date,
      dueDate: dueDate || undefined,
      reason,
      attachmentUrl,
    });

    toast.success('Loan added successfully!');
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 animate-fade-in">
      {/* Loan Type */}
      <div className="space-y-2">
        <Label>Loan Type *</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLoanType('given')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              loanType === 'given' 
                ? 'border-primary bg-primary-soft' 
                : 'border-border hover:border-primary/50'
            )}
          >
            <div className="p-2 rounded-lg bg-expense-soft">
              <ArrowUpRight className="h-5 w-5 text-expense" />
            </div>
            <div className="text-left">
              <p className="font-medium">I Gave</p>
              <p className="text-xs text-muted-foreground">Money I lent</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLoanType('taken')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              loanType === 'taken' 
                ? 'border-primary bg-primary-soft' 
                : 'border-border hover:border-primary/50'
            )}
          >
            <div className="p-2 rounded-lg bg-income-soft">
              <ArrowDownLeft className="h-5 w-5 text-income" />
            </div>
            <div className="text-left">
              <p className="font-medium">I Took</p>
              <p className="text-xs text-muted-foreground">Money I borrowed</p>
            </div>
          </button>
        </div>
      </div>

      {/* Person Name */}
      <div className="space-y-2">
        <Label htmlFor="personName">
          {loanType === 'given' ? 'Given To *' : 'Taken From *'}
        </Label>
        <Input
          id="personName"
          placeholder="Person's name"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="flex gap-2">
          <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 text-xl font-semibold"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          placeholder="Why was this loan given/taken?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
        />
      </div>

      {/* Attachment */}
      <div className="space-y-2">
        <Label>Attachment</Label>
        {attachmentUrl ? (
          <div className="relative inline-block">
            <img 
              src={attachmentUrl} 
              alt="Proof" 
              className="h-24 w-24 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => setAttachmentUrl(undefined)}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add proof or photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg">
        Save Loan
      </Button>
    </form>
  );
};
