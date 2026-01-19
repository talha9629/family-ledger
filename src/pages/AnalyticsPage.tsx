import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { SavingsTrendChart } from '@/components/charts/SavingsTrendChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  return (
    <div className="page-enter pb-6">
      <PageHeader title="Analytics" showBack />

      <div className="px-4 mb-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 space-y-4">
        <SpendingPieChart period={period} />
        <IncomeExpenseChart />
        <SavingsTrendChart />
      </div>
    </div>
  );
};
