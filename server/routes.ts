import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertIncomeEntrySchema,
  insertExpenseSchema,
  insertDebtSchema,
  insertDebtPaymentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/income", async (req, res) => {
    try {
      const entries = await storage.getIncomeEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income entries" });
    }
  });

  app.post("/api/income", async (req, res) => {
    try {
      const validated = insertIncomeEntrySchema.parse(req.body);
      const entry = await storage.createIncomeEntry(validated);
      res.status(201).json(entry);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid income entry data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create income entry" });
      }
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    try {
      await storage.deleteIncomeEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income entry" });
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validated = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validated);
      res.status(201).json(expense);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid expense data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  app.get("/api/debts", async (req, res) => {
    try {
      const debts = await storage.getDebts();
      res.json(debts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts", async (req, res) => {
    try {
      const validated = insertDebtSchema.parse(req.body);
      const debt = await storage.createDebt(validated);
      res.status(201).json(debt);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid debt data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create debt" });
      }
    }
  });

  app.delete("/api/debts/:id", async (req, res) => {
    try {
      await storage.deleteDebt(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete debt" });
    }
  });

  app.get("/api/debt-payments", async (req, res) => {
    try {
      const payments = await storage.getDebtPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debt payments" });
    }
  });

  app.post("/api/debt-payments", async (req, res) => {
    try {
      const validated = insertDebtPaymentSchema.parse(req.body);
      const payment = await storage.createDebtPayment(validated);
      res.status(201).json(payment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid debt payment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create debt payment" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
