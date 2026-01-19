import { Currency, CurrencyCode } from '@/types/finance';

export const currencies: Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 278.50 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 302.80 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 352.40 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 75.85 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 74.25 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 3.32 },
];

export const getCurrency = (code: CurrencyCode): Currency => {
  return currencies.find(c => c.code === code) || currencies[0];
};

export const formatCurrency = (amount: number, code: CurrencyCode = 'PKR'): string => {
  const currency = getCurrency(code);
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency.symbol} ${formattedAmount}`;
};

export const convertCurrency = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);
  // Convert to PKR first, then to target currency
  const pkrAmount = amount * fromCurrency.rate;
  return pkrAmount / toCurrency.rate;
};
