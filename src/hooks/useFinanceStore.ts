import { useState, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  Loan, 
  Committee, 
  Category, 
  SavingsGoal, 
  Budget,
  CurrencyCode,
  ChatMessage,
  FinanceState
} from '@/types/finance';
import { defaultCategories } from '@/data/categories';

const STORAGE_KEY = 'family-finance-data';

const initialState: FinanceState = {
  transactions: [],
  loans: [],
  committees: [],
  categories: defaultCategories,
  savingsGoals: [],
  budgets: [],
  defaultCurrency: 'PKR',
  chatHistory: [],
};

// Sample data for demonstration
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 150000,
    currency: 'PKR',
    category: 'salary',
    description: 'Monthly Salary',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'expense',
    amount: 25000,
    currency: 'PKR',
    category: 'groceries',
    description: 'Monthly groceries from Metro',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    amount: 5000,
    currency: 'PKR',
    category: 'utilities',
    description: 'Electricity bill',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'savings',
    amount: 20000,
    currency: 'PKR',
    category: 'emergency',
    description: 'Emergency fund contribution',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleLoans: Loan[] = [
  {
    id: '1',
    type: 'given',
    personName: 'Ahmed Bhai',
    amount: 50000,
    currency: 'PKR',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    reason: 'Medical emergency',
    payments: [],
    isSettled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleCommittees: Committee[] = [
  {
    id: '1',
    name: 'Office Committee',
    totalMembers: 10,
    monthlyAmount: 10000,
    currency: 'PKR',
    startDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    myPayoutMonth: 7,
    currentMonth: 3,
    status: 'active',
    organizer: 'Farhan Sahab',
    payments: [
      { id: '1', committeeId: '1', month: 1, year: 2025, amount: 10000, paidDate: new Date(Date.now() - 60 * 86400000).toISOString(), createdAt: new Date().toISOString() },
      { id: '2', committeeId: '1', month: 2, year: 2025, amount: 10000, paidDate: new Date(Date.now() - 30 * 86400000).toISOString(), createdAt: new Date().toISOString() },
      { id: '3', committeeId: '1', month: 3, year: 2025, amount: 10000, paidDate: new Date().toISOString(), createdAt: new Date().toISOString() },
    ],
    hasReceivedPayout: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleSavingsGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'New Baby Preparation',
    targetAmount: 200000,
    currentAmount: 75000,
    currency: 'PKR',
    deadline: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    icon: 'Baby',
    color: 'hsl(195, 80%, 50%)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Emergency Fund',
    targetAmount: 500000,
    currentAmount: 180000,
    currency: 'PKR',
    icon: 'ShieldCheck',
    color: 'hsl(0, 75%, 55%)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useFinanceStore = () => {
  const [state, setState] = useState<FinanceState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Return initial state with sample data
          return {
            ...initialState,
            transactions: sampleTransactions,
            loans: sampleLoans,
            committees: sampleCommittees,
            savingsGoals: sampleSavingsGoals,
          };
        }
      }
    }
    return {
      ...initialState,
      transactions: sampleTransactions,
      loans: sampleLoans,
      committees: sampleCommittees,
      savingsGoals: sampleSavingsGoals,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Transaction operations
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  // Loan operations
  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'payments' | 'isSettled' | 'createdAt' | 'updatedAt'>) => {
    const newLoan: Loan = {
      ...loan,
      id: crypto.randomUUID(),
      payments: [],
      isSettled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      loans: [newLoan, ...prev.loans],
    }));
    return newLoan;
  }, []);

  const updateLoan = useCallback((id: string, updates: Partial<Loan>) => {
    setState(prev => ({
      ...prev,
      loans: prev.loans.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      loans: prev.loans.filter(l => l.id !== id),
    }));
  }, []);

  const addLoanPayment = useCallback((loanId: string, amount: number, date: string, note?: string) => {
    setState(prev => {
      const loan = prev.loans.find(l => l.id === loanId);
      if (!loan) return prev;

      const newPayment = {
        id: crypto.randomUUID(),
        loanId,
        amount,
        date,
        note,
        createdAt: new Date().toISOString(),
      };

      const updatedPayments = [...loan.payments, newPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const isSettled = totalPaid >= loan.amount;

      return {
        ...prev,
        loans: prev.loans.map(l => 
          l.id === loanId 
            ? { ...l, payments: updatedPayments, isSettled, updatedAt: new Date().toISOString() } 
            : l
        ),
      };
    });
  }, []);

  // Committee operations
  const addCommittee = useCallback((committee: Omit<Committee, 'id' | 'payments' | 'hasReceivedPayout' | 'createdAt' | 'updatedAt'>) => {
    const newCommittee: Committee = {
      ...committee,
      id: crypto.randomUUID(),
      payments: [],
      hasReceivedPayout: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      committees: [newCommittee, ...prev.committees],
    }));
    return newCommittee;
  }, []);

  const updateCommittee = useCallback((id: string, updates: Partial<Committee>) => {
    setState(prev => ({
      ...prev,
      committees: prev.committees.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  }, []);

  const deleteCommittee = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      committees: prev.committees.filter(c => c.id !== id),
    }));
  }, []);

  const addCommitteePayment = useCallback((committeeId: string, month: number, year: number, amount: number) => {
    const newPayment = {
      id: crypto.randomUUID(),
      committeeId,
      month,
      year,
      amount,
      paidDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      committees: prev.committees.map(c => 
        c.id === committeeId 
          ? { 
              ...c, 
              payments: [...c.payments, newPayment],
              currentMonth: Math.max(c.currentMonth, month),
              updatedAt: new Date().toISOString() 
            } 
          : c
      ),
    }));
  }, []);

  // Savings Goal operations
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      savingsGoals: [newGoal, ...prev.savingsGoals],
    }));
    return newGoal;
  }, []);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => 
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      ),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id),
    }));
  }, []);

  // Category operations
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    return newCategory;
  }, []);

  // Chat operations
  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
    }));
    return newMessage;
  }, []);

  const clearChatHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      chatHistory: [],
    }));
  }, []);

  // Settings
  const setDefaultCurrency = useCallback((currency: CurrencyCode) => {
    setState(prev => ({
      ...prev,
      defaultCurrency: currency,
    }));
  }, []);

  // Export/Import
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addLoan,
    updateLoan,
    deleteLoan,
    addLoanPayment,
    addCommittee,
    updateCommittee,
    deleteCommittee,
    addCommitteePayment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addCategory,
    addChatMessage,
    clearChatHistory,
    setDefaultCurrency,
    exportData,
    importData,
    clearAllData,
  };
};
