import { Category } from '@/types/finance';

export const defaultCategories: Category[] = [
  // Income categories
  { id: 'salary', name: 'Salary', icon: 'Briefcase', type: 'income', color: 'hsl(145, 65%, 42%)' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', type: 'income', color: 'hsl(168, 70%, 38%)' },
  { id: 'business', name: 'Business', icon: 'Building2', type: 'income', color: 'hsl(195, 80%, 45%)' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp', type: 'income', color: 'hsl(210, 85%, 55%)' },
  { id: 'gift-income', name: 'Gift Received', icon: 'Gift', type: 'income', color: 'hsl(280, 60%, 55%)' },
  { id: 'other-income', name: 'Other Income', icon: 'Wallet', type: 'income', color: 'hsl(45, 90%, 50%)' },

  // Expense categories
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', type: 'expense', color: 'hsl(145, 65%, 42%)' },
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', type: 'expense', color: 'hsl(25, 95%, 55%)' },
  { id: 'transport', name: 'Transport', icon: 'Car', type: 'expense', color: 'hsl(210, 85%, 55%)' },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', type: 'expense', color: 'hsl(45, 90%, 50%)' },
  { id: 'rent', name: 'Rent', icon: 'Home', type: 'expense', color: 'hsl(280, 60%, 55%)' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', type: 'expense', color: 'hsl(0, 75%, 55%)' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', type: 'expense', color: 'hsl(168, 70%, 38%)' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', type: 'expense', color: 'hsl(330, 70%, 55%)' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', type: 'expense', color: 'hsl(260, 70%, 55%)' },
  { id: 'kids', name: 'Kids & Baby', icon: 'Baby', type: 'expense', color: 'hsl(195, 80%, 50%)' },
  { id: 'clothing', name: 'Clothing', icon: 'Shirt', type: 'expense', color: 'hsl(15, 85%, 55%)' },
  { id: 'mobile', name: 'Mobile & Internet', icon: 'Smartphone', type: 'expense', color: 'hsl(240, 60%, 55%)' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', type: 'expense', color: 'hsl(180, 50%, 45%)' },
  { id: 'gift-expense', name: 'Gifts Given', icon: 'Gift', type: 'expense', color: 'hsl(340, 70%, 55%)' },
  { id: 'charity', name: 'Charity & Zakat', icon: 'HandHeart', type: 'expense', color: 'hsl(168, 65%, 45%)' },
  { id: 'other-expense', name: 'Other Expense', icon: 'MoreHorizontal', type: 'expense', color: 'hsl(220, 15%, 50%)' },

  // Savings categories
  { id: 'emergency', name: 'Emergency Fund', icon: 'ShieldCheck', type: 'savings', color: 'hsl(0, 75%, 55%)' },
  { id: 'retirement', name: 'Retirement', icon: 'Landmark', type: 'savings', color: 'hsl(210, 85%, 55%)' },
  { id: 'vacation', name: 'Vacation', icon: 'Plane', type: 'savings', color: 'hsl(195, 80%, 50%)' },
  { id: 'education-savings', name: 'Kids Education', icon: 'GraduationCap', type: 'savings', color: 'hsl(168, 70%, 38%)' },
  { id: 'house', name: 'House/Property', icon: 'Home', type: 'savings', color: 'hsl(25, 95%, 55%)' },
  { id: 'car-savings', name: 'Car', icon: 'Car', type: 'savings', color: 'hsl(280, 60%, 55%)' },
  { id: 'wedding', name: 'Wedding', icon: 'Heart', type: 'savings', color: 'hsl(340, 70%, 55%)' },
  { id: 'new-baby', name: 'New Baby', icon: 'Baby', type: 'savings', color: 'hsl(45, 90%, 50%)' },
  { id: 'general-savings', name: 'General Savings', icon: 'PiggyBank', type: 'savings', color: 'hsl(145, 65%, 42%)' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return defaultCategories.find(c => c.id === id);
};

export const getCategoriesByType = (type: Category['type']): Category[] => {
  return defaultCategories.filter(c => c.type === type);
};
