import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Transaction, 
  Loan, 
  Committee, 
  Category, 
  SavingsGoal, 
  Budget,
  Account,
  CurrencyCode,
  ChatMessage,
  FinanceState
} from '@/types/finance';
import { defaultCategories } from '@/data/categories';
import { defaultAccounts } from '@/data/accounts';
import { safeValidateFinanceData } from '@/lib/financeValidation';
import { loadEncrypted, saveEncrypted, isEncrypted } from '@/lib/encryptedStorage';

const STORAGE_KEY = 'family-finance-data';

const initialState: FinanceState = {
  transactions: [],
  loans: [],
  committees: [],
  categories: defaultCategories,
  savingsGoals: [],
  budgets: [],
  accounts: defaultAccounts,
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

const getInitialStateWithSamples = () => ({
  ...initialState,
  transactions: sampleTransactions,
  loans: sampleLoans,
  committees: sampleCommittees,
  savingsGoals: sampleSavingsGoals,
});

interface FinanceContextType {
  // State
  transactions: Transaction[];
  loans: Loan[];
  committees: Committee[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  accounts: Account[];
  defaultCurrency: CurrencyCode;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Loan operations
  addLoan: (loan: Omit<Loan, 'id' | 'payments' | 'isSettled' | 'createdAt' | 'updatedAt' | 'transactionId'>) => Loan;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addLoanPayment: (loanId: string, amount: number, date: string, note?: string, accountId?: string) => void;
  
  // Committee operations
  addCommittee: (committee: Omit<Committee, 'id' | 'payments' | 'hasReceivedPayout' | 'createdAt' | 'updatedAt'>) => Committee;
  updateCommittee: (id: string, updates: Partial<Committee>) => void;
  deleteCommittee: (id: string) => void;
  addCommitteePayment: (committeeId: string, month: number, year: number, amount: number) => void;
  removeCommitteePayment: (committeeId: string, month: number) => void;
  
  // Savings Goal operations
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => SavingsGoal;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  
  // Budget operations
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Budget;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Account operations
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, amount: number, description?: string, date?: string) => { withdrawal: Transaction; deposit: Transaction } | null;
  
  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => Category;
  
  // Chat operations
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  clearChatHistory: () => void;
  
  // Settings
  setDefaultCurrency: (currency: CurrencyCode) => void;
  
  // Import/Export
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { encryptionKey, isPinSet, isLocked } = useAuth();
  const [state, setState] = useState<FinanceState>(getInitialStateWithSamples());
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Load data on mount or when unlocked
  useEffect(() => {
    const loadData = async () => {
      // Don't load if locked with PIN set
      if (isPinSet && isLocked) {
        setIsLoading(true);
        return;
      }

      // Check if data is encrypted
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData && isEncrypted(rawData)) {
        // Data is encrypted, need key
        if (!encryptionKey) {
          setIsLoading(true);
          return;
        }
      }

      try {
        const data = await loadEncrypted(STORAGE_KEY, encryptionKey);
        if (data) {
          const parsed = JSON.parse(data);
          setState(parsed);
        }
        hasLoadedRef.current = true;
      } catch {
        // Use initial state with samples if decryption fails
        hasLoadedRef.current = true;
      }
      setIsLoading(false);
    };

    loadData();
  }, [encryptionKey, isPinSet, isLocked]);

  // Save data whenever state changes (debounced)
  useEffect(() => {
    // Don't save if still loading or haven't loaded yet
    if (isLoading || !hasLoadedRef.current) return;
    
    // Don't save if locked
    if (isPinSet && isLocked) return;

    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const data = JSON.stringify(state);
        const sizeInBytes = new Blob([data]).size;
        const sizeMB = sizeInBytes / (1024 * 1024);
        
        if (sizeMB > 4 && import.meta.env.DEV) {
          console.warn(`Storage usage: ${sizeMB.toFixed(2)}MB - approaching quota limit`);
        }
        
        await saveEncrypted(STORAGE_KEY, data, encryptionKey);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          if (import.meta.env.DEV) {
            console.error('Storage quota exceeded! Attempting cleanup...');
          }
          
          const prunedState = {
            ...state,
            chatHistory: state.chatHistory.slice(-50),
          };
          
          try {
            await saveEncrypted(STORAGE_KEY, JSON.stringify(prunedState), encryptionKey);
            if (import.meta.env.DEV) {
              console.log('Storage cleanup successful - pruned old chat messages');
            }
          } catch (retryError) {
            if (import.meta.env.DEV) {
              console.error('Storage still full after cleanup. Please export and clear old data.');
            }
          }
        } else {
          if (import.meta.env.DEV) {
            console.error('Failed to save to localStorage:', error);
          }
        }
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, encryptionKey, isPinSet, isLocked, isLoading]);

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
  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'payments' | 'isSettled' | 'createdAt' | 'updatedAt' | 'transactionId'>) => {
    const loanId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();
    
    const transaction: Transaction = {
      id: transactionId,
      type: loan.type === 'taken' ? 'income' : 'expense',
      amount: loan.amount,
      currency: loan.currency,
      category: loan.type === 'taken' ? 'loan-received' : 'loan-given',
      description: loan.type === 'taken' 
        ? `Loan received from ${loan.personName}${loan.reason ? `: ${loan.reason}` : ''}`
        : `Loan given to ${loan.personName}${loan.reason ? `: ${loan.reason}` : ''}`,
      date: loan.date,
      accountId: loan.accountId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newLoan: Loan = {
      ...loan,
      id: loanId,
      transactionId,
      payments: [],
      isSettled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => {
      const updatedAccounts = loan.accountId 
        ? prev.accounts.map(a => {
            if (a.id === loan.accountId) {
              const balanceChange = loan.type === 'taken' ? loan.amount : -loan.amount;
              return { ...a, balance: a.balance + balanceChange, updatedAt: new Date().toISOString() };
            }
            return a;
          })
        : prev.accounts;

      return {
        ...prev,
        loans: [newLoan, ...prev.loans],
        transactions: [transaction, ...prev.transactions],
        accounts: updatedAccounts,
      };
    });
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
    setState(prev => {
      const loan = prev.loans.find(l => l.id === id);
      if (!loan) return prev;

      const transactionIdsToRemove = [
        loan.transactionId,
        ...loan.payments.map(p => p.transactionId)
      ].filter(Boolean) as string[];

      return {
        ...prev,
        loans: prev.loans.filter(l => l.id !== id),
        transactions: prev.transactions.filter(t => !transactionIdsToRemove.includes(t.id)),
      };
    });
  }, []);

  const addLoanPayment = useCallback((
    loanId: string, 
    amount: number, 
    date: string, 
    note?: string,
    accountId?: string
  ) => {
    setState(prev => {
      const loan = prev.loans.find(l => l.id === loanId);
      if (!loan) return prev;

      const paymentId = crypto.randomUUID();
      const transactionId = crypto.randomUUID();
      const effectiveAccountId = accountId || loan.accountId;

      const transaction: Transaction = {
        id: transactionId,
        type: loan.type === 'taken' ? 'expense' : 'income',
        amount,
        currency: loan.currency,
        category: loan.type === 'taken' ? 'loan-repayment' : 'loan-received-back',
        description: loan.type === 'taken' 
          ? `Loan repayment to ${loan.personName}${note ? `: ${note}` : ''}`
          : `Loan repayment from ${loan.personName}${note ? `: ${note}` : ''}`,
        date,
        accountId: effectiveAccountId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newPayment = {
        id: paymentId,
        loanId,
        amount,
        date,
        note,
        accountId: effectiveAccountId,
        transactionId,
        createdAt: new Date().toISOString(),
      };

      const updatedPayments = [...loan.payments, newPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const isSettled = totalPaid >= loan.amount;

      const updatedAccounts = effectiveAccountId 
        ? prev.accounts.map(a => {
            if (a.id === effectiveAccountId) {
              const balanceChange = loan.type === 'taken' ? -amount : amount;
              return { ...a, balance: a.balance + balanceChange, updatedAt: new Date().toISOString() };
            }
            return a;
          })
        : prev.accounts;

      return {
        ...prev,
        loans: prev.loans.map(l => 
          l.id === loanId 
            ? { ...l, payments: updatedPayments, isSettled, updatedAt: new Date().toISOString() } 
            : l
        ),
        transactions: [transaction, ...prev.transactions],
        accounts: updatedAccounts,
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

  const removeCommitteePayment = useCallback((committeeId: string, month: number) => {
    setState(prev => ({
      ...prev,
      committees: prev.committees.map(c => 
        c.id === committeeId 
          ? { 
              ...c, 
              payments: c.payments.filter(p => p.month !== month),
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

  // Budget operations
  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      budgets: [newBudget, ...prev.budgets],
    }));
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => 
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      ),
    }));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id),
    }));
  }, []);

  // Account operations
  const addAccount = useCallback((account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
    }));
    return newAccount;
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => 
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id),
    }));
  }, []);

  const setDefaultAccount = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => ({
        ...a,
        isDefault: a.id === id,
        updatedAt: a.id === id ? new Date().toISOString() : a.updatedAt,
      })),
    }));
  }, []);

  const transferBetweenAccounts = useCallback((
    fromAccountId: string, 
    toAccountId: string, 
    amount: number, 
    description?: string,
    date?: string
  ) => {
    const transferDate = date || new Date().toISOString().split('T')[0];
    const fromAccount = state.accounts.find(a => a.id === fromAccountId);
    const toAccount = state.accounts.find(a => a.id === toAccountId);
    
    if (!fromAccount || !toAccount) return null;
    
    const withdrawalTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'expense',
      amount,
      currency: fromAccount.currency,
      category: 'transfer-out',
      description: `Transfer to ${toAccount.name}${description ? `: ${description}` : ''}`,
      date: transferDate,
      accountId: fromAccountId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const depositTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'income',
      amount,
      currency: toAccount.currency,
      category: 'transfer-in',
      description: `Transfer from ${fromAccount.name}${description ? `: ${description}` : ''}`,
      date: transferDate,
      accountId: toAccountId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      transactions: [depositTransaction, withdrawalTransaction, ...prev.transactions],
      accounts: prev.accounts.map(a => {
        if (a.id === fromAccountId) {
          return { ...a, balance: a.balance - amount, updatedAt: new Date().toISOString() };
        }
        if (a.id === toAccountId) {
          return { ...a, balance: a.balance + amount, updatedAt: new Date().toISOString() };
        }
        return a;
      }),
    }));
    
    return { withdrawal: withdrawalTransaction, deposit: depositTransaction };
  }, [state.accounts]);

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
  const MAX_CHAT_MESSAGES = 100;
  
  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const trimmedContent = message.content.trim();
    if (message.role === 'user' && trimmedContent.length > 500) {
      if (import.meta.env.DEV) {
        console.warn('Message too long, truncating to 500 characters');
      }
    }
    
    const newMessage: ChatMessage = {
      ...message,
      content: message.role === 'user' ? trimmedContent.slice(0, 500) : message.content,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    setState(prev => {
      const updatedHistory = [...prev.chatHistory, newMessage];
      const prunedHistory = updatedHistory.length > MAX_CHAT_MESSAGES
        ? updatedHistory.slice(-MAX_CHAT_MESSAGES)
        : updatedHistory;
      
      return {
        ...prev,
        chatHistory: prunedHistory,
      };
    });
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

  // Export/Import - Export is always unencrypted for portability
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      const validatedData = safeValidateFinanceData(parsed);
      
      if (validatedData === null) {
        return false;
      }
      
      setState(validatedData as FinanceState);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Import parsing failed:', error);
      }
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setState(initialState);
  }, []);

  const value: FinanceContextType = {
    ...state,
    isLoading,
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
    removeCommitteePayment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addBudget,
    updateBudget,
    deleteBudget,
    addAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    transferBetweenAccounts,
    addCategory,
    addChatMessage,
    clearChatHistory,
    setDefaultCurrency,
    exportData,
    importData,
    clearAllData,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
