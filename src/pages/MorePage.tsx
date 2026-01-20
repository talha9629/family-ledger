import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { currencies } from '@/data/currencies';
import { CurrencyCode } from '@/types/finance';
import { 
  ChevronRight, Download, Upload, Trash2, Target, 
  BarChart2, Coins, Bell, Palette
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const MorePage = () => {
  const navigate = useNavigate();
  const { 
    defaultCurrency, 
    setDefaultCurrency, 
    exportData, 
    importData, 
    clearAllData 
  } = useFinance();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = importData(content);
          if (success) {
            toast.success('Data imported successfully!');
          } else {
            toast.error('Failed to import data. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      clearAllData();
      toast.success('All data cleared');
    }
  };

  const menuSections = [
    {
      title: 'Quick Access',
      items: [
        { icon: Target, label: 'Savings Goals', path: '/goals' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { 
          icon: Coins, 
          label: 'Default Currency', 
          action: 'currency' 
        },
        { icon: Bell, label: 'Notifications', action: 'notifications' },
        { icon: Palette, label: 'Appearance', action: 'appearance' },
      ]
    },
    {
      title: 'Data Management',
      items: [
        { icon: Download, label: 'Export Data', action: 'export' },
        { icon: Upload, label: 'Import Data', action: 'import' },
        { icon: Trash2, label: 'Clear All Data', action: 'clear', danger: true },
      ]
    },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'export':
        handleExport();
        break;
      case 'import':
        handleImport();
        break;
      case 'clear':
        handleClearData();
        break;
      case 'notifications':
        toast.info('Notification settings coming soon!');
        break;
      case 'appearance':
        toast.info('Theme settings coming soon!');
        break;
    }
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader title="More" />

      <div className="px-4 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">
              {section.title}
            </h3>
            <div className="bg-card rounded-2xl overflow-hidden shadow-card">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx}>
                  {item.action === 'currency' ? (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Select 
                        value={defaultCurrency} 
                        onValueChange={(v) => setDefaultCurrency(v as CurrencyCode)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.symbol} {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                        } else if (item.action) {
                          handleAction(item.action);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.danger ? 'bg-destructive/10' : 'bg-muted'}`}>
                          <item.icon className={`h-5 w-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`font-medium ${item.danger ? 'text-destructive' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  {itemIdx < section.items.length - 1 && (
                    <div className="border-b ml-14" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm font-medium">Family Finance</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with ❤️ for your family's financial wellness
          </p>
        </div>
      </div>
    </div>
  );
};
