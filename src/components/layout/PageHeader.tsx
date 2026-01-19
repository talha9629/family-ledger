import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  rightAction,
  className 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn('sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-area-inset-top', className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};
