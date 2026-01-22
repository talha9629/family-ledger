import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "./contexts/FinanceContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppLayout } from "./components/layout/AppLayout";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";

// Pages
import Index from "./pages/Index";
import { TransactionsPage } from "./pages/TransactionsPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { LoansPage } from "./pages/LoansPage";
import { LoanDetailPage } from "./pages/LoanDetailPage";
import { CommitteePage } from "./pages/CommitteePage";
import { CommitteeDetailPage } from "./pages/CommitteeDetailPage";
import { ChatPage } from "./pages/ChatPage";
import { MorePage } from "./pages/MorePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { AddTransactionPage } from "./pages/AddTransactionPage";
import { AddLoanPage } from "./pages/AddLoanPage";
import { AddCommitteePage } from "./pages/AddCommitteePage";
import { AddGoalPage } from "./pages/AddGoalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <NotificationProvider>
        <FinanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <UpdatePrompt />
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/transaction/:id" element={<TransactionDetailPage />} />
                  <Route path="/loans" element={<LoansPage />} />
                  <Route path="/loan/:id" element={<LoanDetailPage />} />
                  <Route path="/committee" element={<CommitteePage />} />
                  <Route path="/committee/:id" element={<CommitteeDetailPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/more" element={<MorePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/budgets" element={<BudgetPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  {/* Specific add routes must come before the dynamic :type route */}
                  <Route path="/add/loan" element={<AddLoanPage />} />
                  <Route path="/add/committee" element={<AddCommitteePage />} />
                  <Route path="/add/goal" element={<AddGoalPage />} />
                  <Route path="/add/:type" element={<AddTransactionPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </TooltipProvider>
        </FinanceProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
