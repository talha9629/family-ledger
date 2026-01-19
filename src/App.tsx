import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "./contexts/FinanceContext";
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import Index from "./pages/Index";
import { TransactionsPage } from "./pages/TransactionsPage";
import { LoansPage } from "./pages/LoansPage";
import { CommitteePage } from "./pages/CommitteePage";
import { ChatPage } from "./pages/ChatPage";
import { MorePage } from "./pages/MorePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { AddTransactionPage } from "./pages/AddTransactionPage";
import { AddLoanPage } from "./pages/AddLoanPage";
import { AddCommitteePage } from "./pages/AddCommitteePage";
import { AddGoalPage } from "./pages/AddGoalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FinanceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/committee" element={<CommitteePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/add/:type" element={<AddTransactionPage />} />
              <Route path="/add/loan" element={<AddLoanPage />} />
              <Route path="/add/committee" element={<AddCommitteePage />} />
              <Route path="/add/goal" element={<AddGoalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </FinanceProvider>
  </QueryClientProvider>
);

export default App;
