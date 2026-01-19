import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceStore } from '@/hooks/useFinanceStore';

type FinanceContextType = ReturnType<typeof useFinanceStore>;

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useFinanceStore();
  
  return (
    <FinanceContext.Provider value={store}>
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
