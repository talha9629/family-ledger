import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { TransactionType, CurrencyCode } from '@/types/finance';
import { getCategoriesByType } from '@/data/categories';
import { currencies } from '@/data/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TransactionFormProps {
  type: TransactionType;
}

export const TransactionForm = ({ type }: TransactionFormProps) => {
  const navigate = useNavigate();
  const { addTransaction, defaultCurrency } = useFinance();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();

  const categories = getCategoriesByType(type);

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
    
    if (!amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date,
      attachmentUrl,
    });

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
    navigate(-1);
  };

  const typeConfig = {
    income: { title: 'Add Income', color: 'text-income' },
    expense: { title: 'Add Expense', color: 'text-expense' },
    savings: { title: 'Add to Savings', color: 'text-savings' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 animate-fade-in">
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

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                  isSelected 
                    ? 'border-primary bg-primary-soft' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <IconComponent className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-medium text-center line-clamp-1">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add a note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
              alt="Receipt" 
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
            <span className="text-sm text-muted-foreground">Add receipt or photo</span>
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
        Save {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    </form>
  );
};
