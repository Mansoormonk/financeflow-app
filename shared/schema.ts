import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incomeEntries = pgTable("income_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debts = pgTable("debts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creditorName: text("creditor_name").notNull(),
  principalAmount: numeric("principal_amount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  debtType: text("debt_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debtPayments = pgTable("debt_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  debtId: varchar("debt_id").notNull().references(() => debts.id),
  paymentDate: timestamp("payment_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIncomeEntrySchema = createInsertSchema(incomeEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().or(z.date()),
  amount: z.number().positive(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().or(z.date()),
  amount: z.number().positive(),
});

export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
}).extend({
  principalAmount: z.number().positive(),
  currentBalance: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  dueDate: z.string().or(z.date()).optional(),
});

export const insertDebtPaymentSchema = createInsertSchema(debtPayments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentDate: z.string().or(z.date()),
  amount: z.number().positive(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type InsertIncomeEntry = z.infer<typeof insertIncomeEntrySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = z.infer<typeof insertDebtPaymentSchema>;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Housing",
  "Insurance",
  "Other",
] as const;

export const DEBT_TYPES = [
  "Credit Card",
  "Personal Loan",
  "Home Loan",
  "Car Loan",
  "Student Loan",
  "Business Loan",
  "Other",
] as const;
