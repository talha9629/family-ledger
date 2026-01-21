import { useState } from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TransactionFilter, TransactionType } from '@/types/finance';
import { defaultCategories, getCategoriesByType } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionFiltersProps {
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
}

export const TransactionFilters = ({ filter, onFilterChange }: TransactionFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '');

  const activeFiltersCount = [
    filter.type,
    filter.categoryId,
    filter.period !== 'monthly' ? filter.period : null,
  ].filter(Boolean).length;

  const handlePeriodChange = (period: TransactionFilter['period']) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate = now.toISOString().split('T')[0];

    switch (period) {
      case 'daily':
        startDate = endDate;
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'custom':
        // Keep existing dates or set to this month
        startDate = filter.startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = filter.endDate || endDate;
        break;
    }

    onFilterChange({ ...filter, period, startDate, endDate });
  };

  const handleSearch = () => {
    onFilterChange({ ...filter, searchQuery });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });
  };

  const expenseCategories = getCategoriesByType('expense');
  const incomeCategories = getCategoriesByType('income');
  const savingsCategories = getCategoriesByType('savings');

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2 px-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Transactions</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6 overflow-y-auto">
              {/* Period */}
              <div className="space-y-3">
                <Label className="font-semibold text-sm">Time Period</Label>
                <div className="flex flex-wrap gap-2">
                  {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map(period => (
                    <Button
                      key={period}
                      variant={filter.period === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePeriodChange(period)}
                      className={cn(
                        "min-w-[70px] font-medium",
                        filter.period !== period && "border-2 hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {filter.period === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={filter.startDate || ''}
                      onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={filter.endDate || ''}
                      onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Transaction Type */}
              <div className="space-y-3">
                <Label className="font-semibold text-sm">Type</Label>
                <div className="flex gap-2">
                  {(['income', 'expense', 'savings'] as TransactionType[]).map(type => (
                    <Button
                      key={type}
                      variant={filter.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onFilterChange({ 
                        ...filter, 
                        type: filter.type === type ? undefined : type,
                        categoryId: undefined 
                      })}
                      className={cn(
                        "flex-1 font-medium",
                        filter.type !== type && "border-2 hover:border-primary/50 hover:bg-primary/5",
                        filter.type === type && type === 'income' && "bg-income hover:bg-income/90",
                        filter.type === type && type === 'expense' && "bg-expense hover:bg-expense/90",
                        filter.type === type && type === 'savings' && "bg-savings hover:bg-savings/90"
                      )}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={filter.categoryId || 'all'} 
                  onValueChange={(v) => onFilterChange({ ...filter, categoryId: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filter.type === 'expense' && expenseCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    {filter.type === 'income' && incomeCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    {filter.type === 'savings' && savingsCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    {!filter.type && defaultCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear All
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
          {filter.type && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              {filter.type}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, type: undefined, categoryId: undefined })}
              />
            </Badge>
          )}
          {filter.categoryId && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              {defaultCategories.find(c => c.id === filter.categoryId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filter, categoryId: undefined })}
              />
            </Badge>
          )}
          {filter.period !== 'monthly' && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              {filter.period}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handlePeriodChange('monthly')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
