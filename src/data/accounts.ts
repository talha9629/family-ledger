import { Account } from '@/types/finance';

export const defaultAccounts: Account[] = [
  {
    id: 'cash',
    name: 'Cash',
    type: 'cash',
    balance: 0,
    currency: 'PKR',
    icon: 'Wallet',
    color: 'hsl(142, 71%, 45%)',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const banksList = [
  { id: 'hbl', name: 'HBL - Habib Bank Limited' },
  { id: 'ubl', name: 'UBL - United Bank Limited' },
  { id: 'mcb', name: 'MCB Bank' },
  { id: 'allied', name: 'Allied Bank' },
  { id: 'askari', name: 'Askari Bank' },
  { id: 'bank-alfalah', name: 'Bank Alfalah' },
  { id: 'meezan', name: 'Meezan Bank' },
  { id: 'faysal', name: 'Faysal Bank' },
  { id: 'jazzcash', name: 'JazzCash' },
  { id: 'easypaisa', name: 'Easypaisa' },
  { id: 'nayapay', name: 'NayaPay' },
  { id: 'sadapay', name: 'SadaPay' },
  { id: 'other', name: 'Other' },
];

export const accountTypeConfig = {
  cash: { label: 'Cash', icon: 'Wallet', color: 'hsl(142, 71%, 45%)' },
  bank: { label: 'Bank Account', icon: 'Building2', color: 'hsl(217, 91%, 60%)' },
  wallet: { label: 'Digital Wallet', icon: 'Smartphone', color: 'hsl(280, 87%, 55%)' },
  savings: { label: 'Savings Account', icon: 'PiggyBank', color: 'hsl(45, 93%, 47%)' },
};
