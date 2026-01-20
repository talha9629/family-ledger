import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { getCategoryById, getCategoriesByType } from '@/data/categories';
import { currencies, formatCurrency } from '@/data/currencies';
import { CurrencyCode, TransactionType } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, updateTransaction, deleteTransaction, defaultCurrency } = useFinance();
  
  const transaction = transactions.find(t => t.id === id);
  
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(transaction?.currency || defaultCurrency);
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    transaction?.date ? parseISO(transaction.date) : new Date()
  );

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCurrency(transaction.currency);
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(parseISO(transaction.date));
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <div className="page-enter pb-6">
        <PageHeader title="Transaction Not Found" showBack />
        <div className="px-4 text-center py-12">
          <p className="text-muted-foreground">This transaction doesn't exist.</p>
          <Button variant="link" onClick={() => navigate('/transactions')}>
            Go back to transactions
          </Button>
        </div>
      </div>
    );
  }

  const categories = getCategoriesByType(type);

  const handleSave = () => {
    if (!amount || !category || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateTransaction(transaction.id, {
      type,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date: date.toISOString().split('T')[0],
    });

    toast.success('Transaction updated!');
    navigate('/transactions');
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    toast.success('Transaction deleted');
    navigate('/transactions');
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader 
        title="Edit Transaction" 
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
                <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this transaction.
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

      <div className="px-4 space-y-4">
        {/* Type Selection */}
        <Tabs value={type} onValueChange={(v) => {
          setType(v as TransactionType);
          setCategory('');
        }}>
          <TabsList className="w-full">
            <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
            <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
            <TabsTrigger value="savings" className="flex-1">Savings</TabsTrigger>
          </TabsList>
        </Tabs>

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
              className="flex-1 text-lg"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => {
              const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                    category === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <IconComponent className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs text-center line-clamp-1">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Add a note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
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

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full mt-6" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
