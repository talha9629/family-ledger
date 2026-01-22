import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { AccountType, CurrencyCode } from '@/types/finance';
import { banksList, accountTypeConfig } from '@/data/accounts';
import { currencies } from '@/data/currencies';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Wallet, Building2, Smartphone, PiggyBank, Star, Trash2, Edit2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const accountIcons = [
  'Wallet', 'Building2', 'Smartphone', 'PiggyBank', 'CreditCard', 
  'Banknote', 'CircleDollarSign', 'Landmark', 'BadgeDollarSign'
];

const accountColors = [
  'hsl(142, 71%, 45%)', // Green
  'hsl(217, 91%, 60%)', // Blue  
  'hsl(280, 87%, 55%)', // Purple
  'hsl(45, 93%, 47%)',  // Yellow
  'hsl(0, 84%, 60%)',   // Red
  'hsl(199, 89%, 48%)', // Cyan
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(339, 90%, 51%)', // Pink
];

export const AccountsPage = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, setDefaultAccount, defaultCurrency } = useFinance();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState(accountColors[0]);

  const resetForm = () => {
    setName('');
    setType('cash');
    setBankName('');
    setAccountNumber('');
    setBalance('');
    setCurrency(defaultCurrency);
    setIcon('Wallet');
    setColor(accountColors[0]);
    setEditingId(null);
  };

  const openEditDialog = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account) {
      setName(account.name);
      setType(account.type);
      setBankName(account.bankName || '');
      setAccountNumber(account.accountNumber || '');
      setBalance(account.balance.toString());
      setCurrency(account.currency);
      setIcon(account.icon);
      setColor(account.color);
      setEditingId(id);
      setIsOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    const accountData = {
      name: name.trim(),
      type,
      bankName: type === 'bank' || type === 'wallet' ? bankName : undefined,
      accountNumber: accountNumber || undefined,
      balance: parseFloat(balance) || 0,
      currency,
      icon,
      color,
      isDefault: accounts.length === 0,
    };

    if (editingId) {
      updateAccount(editingId, accountData);
      toast.success('Account updated!');
    } else {
      addAccount(accountData);
      toast.success('Account added!');
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account?.isDefault && accounts.length > 1) {
      const newDefault = accounts.find(a => a.id !== id);
      if (newDefault) {
        setDefaultAccount(newDefault.id);
      }
    }
    deleteAccount(id);
    toast.success('Account deleted');
  };

  const handleSetDefault = (id: string) => {
    setDefaultAccount(id);
    toast.success('Default account updated');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Accounts" showBack />
      
      <div className="p-4 space-y-4">
        {/* Add Account Button */}
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Account' : 'Add New Account'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Account Type */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(accountTypeConfig) as [AccountType, typeof accountTypeConfig.cash][]).map(([key, config]) => {
                    const IconComponent = (Icons as any)[config.icon];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setType(key);
                          setIcon(config.icon);
                          setColor(config.color);
                        }}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          type === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: config.color }} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Savings, JazzCash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Bank Selection (for bank/wallet types) */}
              {(type === 'bank' || type === 'wallet') && (
                <div className="space-y-2">
                  <Label>Bank / Provider</Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank or provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {banksList.map(bank => (
                        <SelectItem key={bank.id} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Account Number (last 4 digits) */}
              {type === 'bank' && (
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number (Last 4 digits)</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              )}

              {/* Initial Balance */}
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
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
                    id="balance"
                    type="number"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="flex-1"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {accountIcons.map(iconName => {
                    const IconComponent = (Icons as any)[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={cn(
                          'p-2 rounded-lg border-2 transition-all',
                          icon === iconName ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <IconComponent className="h-5 w-5" style={{ color }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {accountColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        color === c ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? 'Update Account' : 'Add Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <Card className="p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">No Accounts Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first account to start tracking balances
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map(account => {
              const IconComponent = (Icons as any)[account.icon] || Wallet;
              const currencyData = currencies.find(c => c.code === account.currency);
              
              return (
                <Card 
                  key={account.id} 
                  className={cn(
                    "p-4 transition-all",
                    account.isDefault && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <IconComponent className="h-6 w-6" style={{ color: account.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{account.name}</h3>
                        {account.isDefault && (
                          <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {account.bankName || accountTypeConfig[account.type].label}
                        {account.accountNumber && ` •••• ${account.accountNumber}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {currencyData?.symbol}{account.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {!account.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => handleSetDefault(account.id)}
                      >
                        <Star className="h-3 w-3" />
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => openEditDialog(account.id)}
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{account.name}" from your accounts. Transactions linked to this account will keep their history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(account.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
