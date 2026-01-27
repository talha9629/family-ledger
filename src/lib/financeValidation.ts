import { z } from 'zod';

// Strict CSS color validation pattern
// Supports: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla()
const CSS_COLOR_PATTERN = /^(#[0-9A-Fa-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\))$/;

// Safe color schema with format validation
const SafeColorSchema = z.string().max(50).regex(CSS_COLOR_PATTERN, "Invalid color format");

// Currency codes validation
const CurrencyCodeSchema = z.enum(['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR']);

// Account type validation
const AccountTypeSchema = z.enum(['cash', 'bank', 'wallet', 'savings']);

// Transaction type validation
const TransactionTypeSchema = z.enum(['income', 'expense', 'savings']);

// Loan type validation
const LoanTypeSchema = z.enum(['given', 'taken']);

// Committee status validation
const CommitteeStatusSchema = z.enum(['active', 'completed', 'upcoming']);

// Account schema
const AccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: AccountTypeSchema,
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(20).optional(),
  balance: z.number(),
  currency: CurrencyCodeSchema,
  icon: z.string().max(50),
  color: SafeColorSchema,
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Category schema
const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  icon: z.string().max(50),
  type: TransactionTypeSchema,
  color: SafeColorSchema,
});

// Transaction schema
const TransactionSchema = z.object({
  id: z.string().min(1),
  type: TransactionTypeSchema,
  amount: z.number().nonnegative(),
  currency: CurrencyCodeSchema,
  category: z.string().min(1).max(100),
  description: z.string().max(500),
  date: z.string(),
  accountId: z.string().optional(),
  attachmentUrl: z.string().max(2000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Loan payment schema
const LoanPaymentSchema = z.object({
  id: z.string().min(1),
  loanId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  note: z.string().max(500).optional(),
  accountId: z.string().optional(),
  transactionId: z.string().optional(),
  createdAt: z.string(),
});

// Loan schema
const LoanSchema = z.object({
  id: z.string().min(1),
  type: LoanTypeSchema,
  personName: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: CurrencyCodeSchema,
  date: z.string(),
  dueDate: z.string().optional(),
  reason: z.string().max(500).optional(),
  attachmentUrl: z.string().max(2000).optional(),
  accountId: z.string().optional(),
  transactionId: z.string().optional(),
  payments: z.array(LoanPaymentSchema),
  isSettled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Committee member schema
const CommitteeMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  payoutMonth: z.number().int().positive(),
  hasPaidThisMonth: z.boolean(),
});

// Committee payment schema
const CommitteePaymentSchema = z.object({
  id: z.string().min(1),
  committeeId: z.string().min(1),
  month: z.number().int().positive(),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().positive(),
  paidDate: z.string(),
  createdAt: z.string(),
});

// Committee schema
const CommitteeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  totalMembers: z.number().int().positive(),
  monthlyAmount: z.number().positive(),
  currency: CurrencyCodeSchema,
  startDate: z.string(),
  myPayoutMonth: z.number().int().positive(),
  currentMonth: z.number().int().nonnegative(),
  status: CommitteeStatusSchema,
  organizer: z.string().min(1).max(100),
  members: z.array(CommitteeMemberSchema).optional(),
  payments: z.array(CommitteePaymentSchema),
  hasReceivedPayout: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Savings goal schema
const SavingsGoalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative(),
  currency: CurrencyCodeSchema,
  deadline: z.string().optional(),
  icon: z.string().max(50),
  color: SafeColorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Budget schema
const BudgetSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  currency: CurrencyCodeSchema,
  period: z.enum(['weekly', 'monthly', 'yearly']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Chat action schema
const ChatActionSchema = z.object({
  type: z.enum(['add_transaction', 'create_category', 'set_budget', 'add_loan', 'add_committee']),
  data: z.any(),
});

// Chat message schema
const ChatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'assistant']),
  content: z.string().max(10000),
  timestamp: z.string(),
  action: ChatActionSchema.optional(),
});

// Complete finance state schema
export const FinanceStateSchema = z.object({
  transactions: z.array(TransactionSchema),
  loans: z.array(LoanSchema),
  committees: z.array(CommitteeSchema),
  categories: z.array(CategorySchema),
  savingsGoals: z.array(SavingsGoalSchema),
  budgets: z.array(BudgetSchema),
  accounts: z.array(AccountSchema),
  defaultCurrency: CurrencyCodeSchema,
  chatHistory: z.array(ChatMessageSchema),
});

export type ValidatedFinanceState = z.infer<typeof FinanceStateSchema>;

/**
 * Validates imported finance data against the expected schema.
 * Returns validated data on success, throws ZodError on failure.
 */
export function validateFinanceData(data: unknown): ValidatedFinanceState {
  return FinanceStateSchema.parse(data);
}

/**
 * Safely validates imported finance data.
 * Returns the validated data if successful, null otherwise.
 * Logs validation errors to console.
 */
export function safeValidateFinanceData(data: unknown): ValidatedFinanceState | null {
  const result = FinanceStateSchema.safeParse(data);
  if (result.success) {
    return result.data as ValidatedFinanceState;
  }
  // Only log validation errors in development to avoid leaking data structure
  if (import.meta.env.DEV) {
    console.error('Validation errors:', result.error.issues);
  }
  return null;
}
