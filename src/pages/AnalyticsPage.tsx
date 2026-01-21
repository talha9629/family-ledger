import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { SavingsTrendChart } from '@/components/charts/SavingsTrendChart';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useFinance } from '@/contexts/FinanceContext';
import { getCategoriesByType, getCategoryById } from '@/data/categories';
import { formatCurrency } from '@/data/currencies';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, Filter, List, ChevronRight, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { transactions, defaultCurrency } = useFinance();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [showEntriesSheet, setShowEntriesSheet] = useState(false);

  const expenseCategories = getCategoriesByType('expense');

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    
    if (showCustomDates && customStartDate && customEndDate) {
      return { start: customStartDate, end: customEndDate };
    }
    
    switch (period) {
      case 'daily':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'weekly':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'yearly':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'monthly':
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period, showCustomDates, customStartDate, customEndDate]);

  // Filtered transactions based on category and date range
  const filteredData = useMemo(() => {
    const filtered = transactions.filter(t => {
      // Only expenses for category filter
      if (t.type !== 'expense') return false;
      
      // Date filter
      const transactionDate = parseISO(t.date);
      if (!isWithinInterval(transactionDate, { start: dateRange.start, end: dateRange.end })) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const count = filtered.length;

    // Group by category for breakdown
    const categoryBreakdown: Record<string, { amount: number; count: number; name: string; color: string; icon: string }> = {};
    filtered.forEach(t => {
      const cat = getCategoryById(t.category);
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = {
          amount: 0,
          count: 0,
          name: cat?.name || 'Other',
          color: cat?.color || '#888',
          icon: cat?.icon || 'HelpCircle',
        };
      }
      categoryBreakdown[t.category].amount += t.amount;
      categoryBreakdown[t.category].count += 1;
    });

    return { filtered, total, count, categoryBreakdown };
  }, [transactions, selectedCategory, dateRange]);

  // All transactions for the selected period (not just expenses)
  const allPeriodTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return isWithinInterval(transactionDate, { start: dateRange.start, end: dateRange.end });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateRange]);

  // Summary for all transactions
  const periodSummary = useMemo(() => {
    const income = allPeriodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = allPeriodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = allPeriodTransactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, savings, total: allPeriodTransactions.length };
  }, [allPeriodTransactions]);

  const selectedCategoryData = selectedCategory !== 'all' ? getCategoryById(selectedCategory) : null;
  const SelectedIcon = selectedCategoryData ? (Icons as any)[selectedCategoryData.icon] || Icons.HelpCircle : null;

  return (
    <div className="page-enter pb-6">
      <PageHeader title="Analytics" showBack />

      {/* Period Tabs */}
      <div className="px-4 mb-4">
        <Tabs value={period} onValueChange={(v) => {
          setPeriod(v as 'daily' | 'weekly' | 'monthly' | 'yearly');
          setShowCustomDates(false);
        }}>
          <TabsList className="w-full">
            <TabsTrigger value="daily" className="flex-1">Day</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* View All Entries Button */}
      <div className="px-4 mb-4">
        <Sheet open={showEntriesSheet} onOpenChange={setShowEntriesSheet}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-2 hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-primary" />
                <span>View All {period === 'daily' ? "Today's" : period === 'weekly' ? "This Week's" : period === 'monthly' ? "This Month's" : "This Year's"} Entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{periodSummary.total}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>
                {period === 'daily' ? "Today's" : period === 'weekly' ? "This Week's" : period === 'monthly' ? "This Month's" : "This Year's"} Transactions
              </SheetTitle>
            </SheetHeader>
            
            {/* Period Summary */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-income/10 rounded-xl p-3 text-center border border-income/20">
                <TrendingUp className="h-4 w-4 text-income mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="font-bold text-sm text-income">{formatCurrency(periodSummary.income, defaultCurrency)}</p>
              </div>
              <div className="bg-expense/10 rounded-xl p-3 text-center border border-expense/20">
                <TrendingDown className="h-4 w-4 text-expense mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="font-bold text-sm text-expense">{formatCurrency(periodSummary.expenses, defaultCurrency)}</p>
              </div>
              <div className="bg-savings/10 rounded-xl p-3 text-center border border-savings/20">
                <PiggyBank className="h-4 w-4 text-savings mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Savings</p>
                <p className="font-bold text-sm text-savings">{formatCurrency(periodSummary.savings, defaultCurrency)}</p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] space-y-2">
              {allPeriodTransactions.length > 0 ? (
                allPeriodTransactions.map(t => (
                  <TransactionItem 
                    key={t.id} 
                    transaction={t} 
                    onClick={() => {
                      setShowEntriesSheet(false);
                      navigate(`/transaction/${t.id}`);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No transactions for this period</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4 space-y-3">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Filter by Category
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {expenseCategories.map(cat => {
                const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" style={{ color: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        <div className="space-y-3">
          <Button 
            variant={showCustomDates ? "default" : "outline"}
            size="sm" 
            onClick={() => setShowCustomDates(!showCustomDates)}
            className={cn(
              "w-full justify-center gap-2 font-medium",
              showCustomDates 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "border-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {showCustomDates ? 'Using Custom Dates' : 'Select Custom Date Range'}
          </Button>
          
          {showCustomDates && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 justify-start bg-card border-2 hover:border-primary/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {customStartDate ? format(customStartDate, 'PP') : 'Start Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 justify-start bg-card border-2 hover:border-primary/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {customEndDate ? format(customEndDate, 'PP') : 'End Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Filter Results Summary */}
      {(selectedCategory !== 'all' || showCustomDates) && (
        <div className="px-4 mb-4">
          <div className={cn(
            'rounded-2xl p-4 shadow-card',
            selectedCategoryData ? 'bg-card' : 'bg-expense-soft'
          )}>
            <div className="flex items-center gap-3 mb-3">
              {selectedCategoryData && SelectedIcon && (
                <div 
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${selectedCategoryData.color}20` }}
                >
                  <SelectedIcon className="h-5 w-5" style={{ color: selectedCategoryData.color }} />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {selectedCategoryData?.name || 'All Expenses'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-expense">
                  {formatCurrency(filteredData.total, defaultCurrency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-semibold">{filteredData.count}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown (when filtering by date) */}
      {selectedCategory === 'all' && Object.keys(filteredData.categoryBreakdown).length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Category Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(filteredData.categoryBreakdown)
              .sort(([, a], [, b]) => b.amount - a.amount)
              .map(([catId, data]) => {
                const IconComponent = (Icons as any)[data.icon] || Icons.HelpCircle;
                const percentage = (data.amount / filteredData.total) * 100;
                
                return (
                  <button
                    key={catId}
                    className="w-full flex items-center gap-3 p-3 bg-card rounded-xl shadow-card hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedCategory(catId)}
                  >
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${data.color}20` }}
                    >
                      <IconComponent className="h-4 w-4" style={{ color: data.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{data.name}</p>
                      <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(data.amount, defaultCurrency)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Charts - now with period prop */}
      <div className="px-4 space-y-4">
        <SpendingPieChart period={period} />
        <IncomeExpenseChart period={period} />
        <SavingsTrendChart period={period} />
      </div>
    </div>
  );
};
