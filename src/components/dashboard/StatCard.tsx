import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'savings' | 'loan' | 'committee';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  variant, 
  subtitle,
  trend,
  className 
}: StatCardProps) => {
  return (
    <div className={cn(`stat-card stat-card-${variant}`, className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-xl font-bold mt-1">{amount}</p>
          {subtitle && (
            <p className="text-xs opacity-80 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs mt-1 font-medium',
              trend.isPositive ? 'opacity-90' : 'opacity-80'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="p-2 rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
