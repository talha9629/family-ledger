// src/hooks/useFinanceNotifications.ts
import { useNotifications } from '@/contexts/NotificationContent';
import { notificationService } from '@/services/notificationService';

/**
 * Hook to easily trigger finance notifications based on user settings
 */
export const useFinanceNotifications = () => {
  const { settings, hasPermission } = useNotifications();

  const notifyExpense = async (amount: number, category: string) => {
    if (settings.enabled && hasPermission) {
      await notificationService.notifyExpenseAdded(amount, category);
    }
  };

  const notifyIncome = async (amount: number, source: string) => {
    if (settings.enabled && hasPermission) {
      await notificationService.notifyIncomeAdded(amount, source);
    }
  };

  const notifyBudgetWarning = async (category: string, spent: number, budget: number) => {
    if (settings.enabled && settings.budgetAlerts && hasPermission) {
      const percentage = (spent / budget) * 100;
      
      if (percentage >= 100) {
        await notificationService.notifyBudgetExceeded(category, spent, budget);
      } else if (percentage >= 80) {
        await notificationService.notifyBudgetAlert(category, spent, budget);
      }
    }
  };

  const notifyGoal = async (goalName: string, current: number, target: number) => {
    if (settings.enabled && settings.goalReminders && hasPermission) {
      const percentage = (current / target) * 100;
      
      if (percentage >= 100) {
        await notificationService.notifyGoalAchieved(goalName, target);
      } else {
        await notificationService.notifyGoalProgress(goalName, current, target);
      }
    }
  };

  const notifyLoanDue = async (loanName: string, amount: number, dueDate: string) => {
    if (settings.enabled && settings.loanReminders && hasPermission) {
      await notificationService.notifyLoanPaymentDue(loanName, amount, dueDate);
    }
  };

  const notifyCommitteeDue = async (committeeName: string, amount: number, dueDate: string) => {
    if (settings.enabled && settings.committeeReminders && hasPermission) {
      await notificationService.notifyCommitteePaymentDue(committeeName, amount, dueDate);
    }
  };

  const notifyCommitteeReceived = async (committeeName: string, amount: number) => {
    if (settings.enabled && settings.committeeReminders && hasPermission) {
      await notificationService.notifyCommitteeTurnReceived(committeeName, amount);
    }
  };

  return {
    notifyExpense,
    notifyIncome,
    notifyBudgetWarning,
    notifyGoal,
    notifyLoanDue,
    notifyCommitteeDue,
    notifyCommitteeReceived,
  };
};

// Example usage in your transaction form:
/*
import { useFinanceNotifications } from '@/hooks/useFinanceNotifications';

function TransactionForm() {
  const { notifyExpense, notifyIncome } = useFinanceNotifications();
  
  const handleSubmit = async (data) => {
    // Save transaction...
    
    // Trigger notification
    if (data.type === 'expense') {
      await notifyExpense(data.amount, data.category);
    } else if (data.type === 'income') {
      await notifyIncome(data.amount, data.source);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
*/
