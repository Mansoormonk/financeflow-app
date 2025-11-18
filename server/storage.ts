import type {
  IncomeEntry,
  InsertIncomeEntry,
  Expense,
  InsertExpense,
  Debt,
  InsertDebt,
  DebtPayment,
  InsertDebtPayment,
  User,
  InsertUser,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "password"> & { passwordHash: string }): Promise<User>;

  getIncomeEntries(): Promise<IncomeEntry[]>;
  getIncomeEntry(id: string): Promise<IncomeEntry | undefined>;
  createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry>;
  deleteIncomeEntry(id: string): Promise<void>;

  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  getDebts(): Promise<Debt[]>;
  getDebt(id: string): Promise<Debt | undefined>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: string, debt: Partial<Debt>): Promise<Debt>;
  deleteDebt(id: string): Promise<void>;

  getDebtPayments(): Promise<DebtPayment[]>;
  getDebtPaymentsByDebtId(debtId: string): Promise<DebtPayment[]>;
  createDebtPayment(payment: InsertDebtPayment): Promise<DebtPayment>;
  deleteDebtPayment(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private incomeEntries: Map<string, IncomeEntry>;
  private expenses: Map<string, Expense>;
  private debts: Map<string, Debt>;
  private debtPayments: Map<string, DebtPayment>;

  constructor() {
    this.users = new Map();
    this.incomeEntries = new Map();
    this.expenses = new Map();
    this.debts = new Map();
    this.debtPayments = new Map();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(user: Omit<InsertUser, "password"> & { passwordHash: string }): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getIncomeEntries(): Promise<IncomeEntry[]> {
    return Array.from(this.incomeEntries.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getIncomeEntry(id: string): Promise<IncomeEntry | undefined> {
    return this.incomeEntries.get(id);
  }

  async createIncomeEntry(insertEntry: InsertIncomeEntry): Promise<IncomeEntry> {
    const id = randomUUID();
    const entry: IncomeEntry = {
      ...insertEntry,
      id,
      amount: insertEntry.amount.toString(),
      date: new Date(insertEntry.date),
      description: insertEntry.description || null,
      createdAt: new Date(),
    };
    this.incomeEntries.set(id, entry);
    return entry;
  }

  async deleteIncomeEntry(id: string): Promise<void> {
    this.incomeEntries.delete(id);
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      amount: insertExpense.amount.toString(),
      date: new Date(insertExpense.date),
      description: insertExpense.description || null,
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses.delete(id);
  }

  async getDebts(): Promise<Debt[]> {
    return Array.from(this.debts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDebt(id: string): Promise<Debt | undefined> {
    return this.debts.get(id);
  }

  async createDebt(insertDebt: InsertDebt): Promise<Debt> {
    const id = randomUUID();
    const debt: Debt = {
      ...insertDebt,
      id,
      principalAmount: insertDebt.principalAmount.toString(),
      currentBalance: insertDebt.currentBalance.toString(),
      interestRate: insertDebt.interestRate.toString(),
      dueDate: insertDebt.dueDate ? new Date(insertDebt.dueDate) : null,
      createdAt: new Date(),
    };
    this.debts.set(id, debt);
    return debt;
  }

  async updateDebt(id: string, updates: Partial<Debt>): Promise<Debt> {
    const existing = this.debts.get(id);
    if (!existing) {
      throw new Error("Debt not found");
    }
    const updated = { ...existing, ...updates };
    this.debts.set(id, updated);
    return updated;
  }

  async deleteDebt(id: string): Promise<void> {
    this.debts.delete(id);
    const payments = await this.getDebtPaymentsByDebtId(id);
    payments.forEach((payment) => this.debtPayments.delete(payment.id));
  }

  async getDebtPayments(): Promise<DebtPayment[]> {
    return Array.from(this.debtPayments.values()).sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  async getDebtPaymentsByDebtId(debtId: string): Promise<DebtPayment[]> {
    return Array.from(this.debtPayments.values())
      .filter((payment) => payment.debtId === debtId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  async createDebtPayment(insertPayment: InsertDebtPayment): Promise<DebtPayment> {
    const id = randomUUID();
    const payment: DebtPayment = {
      ...insertPayment,
      id,
      amount: insertPayment.amount.toString(),
      paymentDate: new Date(insertPayment.paymentDate),
      createdAt: new Date(),
    };
    this.debtPayments.set(id, payment);

    const debt = await this.getDebt(insertPayment.debtId);
    if (debt) {
      const newBalance = Number(debt.currentBalance) - insertPayment.amount;
      await this.updateDebt(debt.id, {
        currentBalance: Math.max(0, newBalance).toString(),
      });
    }

    return payment;
  }

  async deleteDebtPayment(id: string): Promise<void> {
    this.debtPayments.delete(id);
  }
}

export const storage = new MemStorage();
