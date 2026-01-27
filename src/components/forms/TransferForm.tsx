import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { currencies } from '@/data/currencies';

export const TransferForm = () => {
  const navigate = useNavigate();
  const { accounts, transferBetweenAccounts, defaultCurrency } = useFinance();
  
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);
  
  const availableToAccounts = accounts.filter(a => a.id !== fromAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccountId || !toAccountId) {
      toast.error('Please select both accounts');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (fromAccountId === toAccountId) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    const result = transferBetweenAccounts(
      fromAccountId,
      toAccountId,
      parseFloat(amount),
      description,
      date
    );

    if (result) {
      toast.success('Transfer completed successfully!');
      navigate(-1);
    } else {
      toast.error('Transfer failed. Please try again.');
    }
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 animate-fade-in">
      {/* From Account */}
      <div className="space-y-2">
        <Label>From Account *</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => {
              const IconComponent = (Icons as any)[account.icon] || Icons.Wallet;
              return (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" style={{ color: account.color }} />
                    <span>{account.name}</span>
                    <span className="text-muted-foreground">
                      ({getCurrencySymbol(account.currency)} {account.balance.toLocaleString()})
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Transfer Arrow */}
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-primary/10">
          <ArrowRight className="h-6 w-6 text-primary rotate-90" />
        </div>
      </div>

      {/* To Account */}
      <div className="space-y-2">
        <Label>To Account *</Label>
        <Select value={toAccountId} onValueChange={setToAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination account" />
          </SelectTrigger>
          <SelectContent>
            {availableToAccounts.map(account => {
              const IconComponent = (Icons as any)[account.icon] || Icons.Wallet;
              return (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" style={{ color: account.color }} />
                    <span>{account.name}</span>
                    <span className="text-muted-foreground">
                      ({getCurrencySymbol(account.currency)} {account.balance.toLocaleString()})
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="relative">
          {fromAccount && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {getCurrencySymbol(fromAccount.currency)}
            </span>
          )}
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={cn("text-xl font-semibold", fromAccount && "pl-12")}
            step="0.01"
            min="0"
            required
          />
        </div>
        {fromAccount && parseFloat(amount) > fromAccount.balance && (
          <p className="text-sm text-destructive">
            Insufficient balance (Available: {getCurrencySymbol(fromAccount.currency)} {fromAccount.balance.toLocaleString()})
          </p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Note (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a note about this transfer..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {/* Summary */}
      {fromAccount && toAccount && amount && (
        <div className="p-4 rounded-xl bg-muted/50 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Transfer Summary</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(() => {
                const IconFrom = (Icons as any)[fromAccount.icon] || Icons.Wallet;
                return <IconFrom className="h-4 w-4" style={{ color: fromAccount.color }} />;
              })()}
              <span className="font-medium">{fromAccount.name}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              {(() => {
                const IconTo = (Icons as any)[toAccount.icon] || Icons.Wallet;
                return <IconTo className="h-4 w-4" style={{ color: toAccount.color }} />;
              })()}
              <span className="font-medium">{toAccount.name}</span>
            </div>
          </div>
          <p className="text-lg font-bold">
            {getCurrencySymbol(fromAccount.currency)} {parseFloat(amount).toLocaleString()}
          </p>
        </div>
      )}

      {/* Submit */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={!fromAccountId || !toAccountId || !amount || parseFloat(amount) <= 0}
      >
        Complete Transfer
      </Button>
    </form>
  );
};
