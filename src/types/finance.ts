// Currency types
export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'INR';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // Rate relative to PKR (PKR = 1)
}

// Account types
export type AccountType = 'cash' | 'bank' | 'wallet' | 'savings';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string; // Only for bank accounts
  accountNumber?: string; // Last 4 digits for display
  balance: number;
  currency: CurrencyCode;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export type TransactionType = 'income' | 'expense' | 'savings';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  category: string;
  description: string;
  date: string;
  accountId?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Loan types
export type LoanType = 'given' | 'taken';

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  type: LoanType;
  personName: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  dueDate?: string;
  reason?: string;
  attachmentUrl?: string;
  payments: LoanPayment[];
  isSettled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Committee types
export type CommitteeStatus = 'active' | 'completed' | 'upcoming';

export interface CommitteeMember {
  id: string;
  name: string;
  payoutMonth: number;
  hasPaidThisMonth: boolean;
}

export interface CommitteePayment {
  id: string;
  committeeId: string;
  month: number;
  year: number;
  amount: number;
  paidDate: string;
  createdAt: string;
}

export interface Committee {
  id: string;
  name: string;
  totalMembers: number;
  monthlyAmount: number;
  currency: CurrencyCode;
  startDate: string;
  myPayoutMonth: number;
  currentMonth: number;
  status: CommitteeStatus;
  organizer: string;
  members?: CommitteeMember[];
  payments: CommitteePayment[];
  hasReceivedPayout: boolean;
  createdAt: string;
  updatedAt: string;
}

// Savings Goal
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  deadline?: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Budget
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: CurrencyCode;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

// Chat message for AI
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: 'add_transaction' | 'create_category' | 'set_budget' | 'add_loan' | 'add_committee';
    data: any;
  };
}

// Filter types
export interface DateFilter {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface TransactionFilter extends DateFilter {
  type?: TransactionType;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface LoanFilter extends DateFilter {
  type?: LoanType;
  personName?: string;
  isSettled?: boolean;
}

export interface CommitteeFilter {
  status?: CommitteeStatus;
  searchQuery?: string;
}

// App State
export interface FinanceState {
  transactions: Transaction[];
  loans: Loan[];
  committees: Committee[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  accounts: Account[];
  defaultCurrency: CurrencyCode;
  chatHistory: ChatMessage[];
}
