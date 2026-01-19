import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { CurrencyCode } from '@/types/finance';
import { currencies } from '@/data/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Target, Baby, Home, Car, Plane, GraduationCap, Heart, 
  ShieldCheck, PiggyBank, Gift, Briefcase, Smartphone 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const goalIcons = [
  { icon: 'Target', component: Target, label: 'General' },
  { icon: 'Baby', component: Baby, label: 'Baby' },
  { icon: 'Home', component: Home, label: 'House' },
  { icon: 'Car', component: Car, label: 'Car' },
  { icon: 'Plane', component: Plane, label: 'Travel' },
  { icon: 'GraduationCap', component: GraduationCap, label: 'Education' },
  { icon: 'Heart', component: Heart, label: 'Wedding' },
  { icon: 'ShieldCheck', component: ShieldCheck, label: 'Emergency' },
  { icon: 'PiggyBank', component: PiggyBank, label: 'Savings' },
  { icon: 'Gift', component: Gift, label: 'Gift' },
  { icon: 'Briefcase', component: Briefcase, label: 'Business' },
  { icon: 'Smartphone', component: Smartphone, label: 'Gadget' },
];

const colors = [
  'hsl(168, 70%, 38%)',
  'hsl(145, 65%, 42%)',
  'hsl(25, 95%, 55%)',
  'hsl(210, 85%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(0, 75%, 55%)',
  'hsl(45, 90%, 50%)',
  'hsl(195, 80%, 50%)',
];

export const SavingsGoalForm = () => {
  const navigate = useNavigate();
  const { addSavingsGoal, defaultCurrency } = useFinance();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    addSavingsGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      currency,
      deadline: deadline || undefined,
      icon: selectedIcon,
      color: selectedColor,
    });

    toast.success('Savings goal created!');
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 animate-fade-in">
      {/* Goal Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name *</Label>
        <Input
          id="name"
          placeholder="e.g., New Baby Preparation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Icon Selection */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-6 gap-2">
          {goalIcons.map(({ icon, component: IconComp, label }) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                selectedIcon === icon 
                  ? 'border-primary bg-primary-soft' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <IconComp className="h-5 w-5" style={{ color: selectedColor }} />
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-transform',
                selectedColor === color 
                  ? 'border-foreground scale-110' 
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Target Amount */}
      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount *</Label>
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
            id="targetAmount"
            type="number"
            placeholder="200000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="flex-1"
            min="0"
            required
          />
        </div>
      </div>

      {/* Current Amount */}
      <div className="space-y-2">
        <Label htmlFor="currentAmount">Already Saved</Label>
        <Input
          id="currentAmount"
          type="number"
          placeholder="0"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
          min="0"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Target Date (Optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg">
        Create Goal
      </Button>
    </form>
  );
};
