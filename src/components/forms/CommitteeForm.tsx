import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { CurrencyCode, CommitteeStatus } from '@/types/finance';
import { currencies } from '@/data/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const CommitteeForm = () => {
  const navigate = useNavigate();
  const { addCommittee, defaultCurrency } = useFinance();
  
  const [name, setName] = useState('');
  const [totalMembers, setTotalMembers] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [myPayoutMonth, setMyPayoutMonth] = useState('');
  const [currentMonth, setCurrentMonth] = useState('1');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState<CommitteeStatus>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalMembers || !monthlyAmount || !myPayoutMonth) {
      toast.error('Please fill in all required fields');
      return;
    }

    addCommittee({
      name,
      totalMembers: parseInt(totalMembers),
      monthlyAmount: parseFloat(monthlyAmount),
      currency,
      startDate,
      myPayoutMonth: parseInt(myPayoutMonth),
      currentMonth: parseInt(currentMonth),
      status,
      organizer,
    });

    toast.success('Committee added successfully!');
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 animate-fade-in">
      {/* Committee Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Committee Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Office Committee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Organizer */}
      <div className="space-y-2">
        <Label htmlFor="organizer">Organizer</Label>
        <Input
          id="organizer"
          placeholder="Who organizes this committee?"
          value={organizer}
          onChange={(e) => setOrganizer(e.target.value)}
        />
      </div>

      {/* Total Members */}
      <div className="space-y-2">
        <Label htmlFor="totalMembers">Total Members *</Label>
        <Input
          id="totalMembers"
          type="number"
          placeholder="10"
          value={totalMembers}
          onChange={(e) => setTotalMembers(e.target.value)}
          min="2"
          required
        />
      </div>

      {/* Monthly Amount */}
      <div className="space-y-2">
        <Label htmlFor="monthlyAmount">Monthly Contribution *</Label>
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
            id="monthlyAmount"
            type="number"
            placeholder="10000"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            className="flex-1"
            min="0"
            required
          />
        </div>
        {totalMembers && monthlyAmount && (
          <p className="text-sm text-muted-foreground">
            Total payout: {currencies.find(c => c.code === currency)?.symbol} {(parseInt(totalMembers) * parseFloat(monthlyAmount)).toLocaleString()}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      {/* My Payout Month */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="myPayoutMonth">My Payout Month *</Label>
          <Input
            id="myPayoutMonth"
            type="number"
            placeholder="7"
            value={myPayoutMonth}
            onChange={(e) => setMyPayoutMonth(e.target.value)}
            min="1"
            max={totalMembers || undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentMonth">Current Month</Label>
          <Input
            id="currentMonth"
            type="number"
            placeholder="1"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            min="1"
            max={totalMembers || undefined}
          />
        </div>
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

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg">
        Save Committee
      </Button>
    </form>
  );
};
