import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { SavingsTrendChart } from '@/components/charts/SavingsTrendChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { getCategoriesByType, getCategoryById } from '@/data/categories';
import { formatCurrency } from '@/data/currencies';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { CalendarIcon, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export const AnalyticsPage = () => {
  const { transactions, defaultCurrency } = useFinance();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [showCustomDates, setShowCustomDates] = useState(false);

  const expenseCategories = getCategoriesByType('expense');

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    
    if (showCustomDates && customStartDate && customEndDate) {
      return { start: customStartDate, end: customEndDate };
    }
    
    switch (period) {
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

  const selectedCategoryData = selectedCategory !== 'all' ? getCategoryById(selectedCategory) : null;
  const SelectedIcon = selectedCategoryData ? (Icons as any)[selectedCategoryData.icon] || Icons.HelpCircle : null;

  return (
    <div className="page-enter pb-6">
      <PageHeader title="Analytics" showBack />

      {/* Period Tabs */}
      <div className="px-4 mb-4">
        <Tabs value={period} onValueChange={(v) => {
          setPeriod(v as any);
          setShowCustomDates(false);
        }}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1">Year</TabsTrigger>
          </TabsList>
        </Tabs>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Custom Date Range</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCustomDates(!showCustomDates)}
              className="h-6 text-xs"
            >
              {showCustomDates ? 'Use Period' : 'Custom Dates'}
            </Button>
          </div>
          
          {showCustomDates && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 justify-start">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {customStartDate ? format(customStartDate, 'PP') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 justify-start">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {customEndDate ? format(customEndDate, 'PP') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
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

      {/* Charts */}
      <div className="px-4 space-y-4">
        <SpendingPieChart period={period} />
        <IncomeExpenseChart />
        <SavingsTrendChart />
      </div>
    </div>
  );
};
