import { Home, CreditCard, PiggyBank, Users, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/transactions', icon: CreditCard, label: 'Transactions' },
  { path: '/loans', icon: Users, label: 'Loans' },
  { path: '/committee', icon: PiggyBank, label: 'Committee' },
  { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { path: '/more', icon: MoreHorizontal, label: 'More' },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn('nav-item flex-1', isActive && 'active')}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
