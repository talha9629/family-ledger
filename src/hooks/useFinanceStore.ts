import { useState, useEffect, useCallback } from 'react';
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
  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'payments' | 'isSettled' | 'createdAt' | 'updatedAt' | 'transactionId'>) => {
    const loanId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();
    
    // Create corresponding transaction
    // If loan is 'taken' (borrowed), it's income for us
    // If loan is 'given' (lent), it's expense for us
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
      // Update account balance if accountId provided
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

      // Get all transaction IDs to remove (loan + payments)
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

      // Create corresponding transaction
      // If loan is 'taken' (we borrowed), payment is expense (we're paying back)
      // If loan is 'given' (we lent), payment is income (we're receiving back)
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

      // Update account balance if accountId provided
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
    
    const transferDescription = description || `Transfer from ${fromAccount.name} to ${toAccount.name}`;
    
    // Create withdrawal transaction from source account
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
    
    // Create deposit transaction to destination account
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

  const importData = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Validate the parsed data against the schema
      const validatedData = safeValidateFinanceData(parsed);
      
      if (validatedData === null) {
        return false;
      }
      
      // Only set state if validation passes - cast to FinanceState as validated data matches the type
      setState(validatedData as FinanceState);
      return true;
    } catch (error) {
      console.error('Import parsing failed:', error);
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
};
