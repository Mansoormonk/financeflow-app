import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingDown, CreditCard, PiggyBank, Receipt, Wallet } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { IncomeEntry, Expense, Debt } from "@shared/schema";

export default function Dashboard() {
  const { data: income, isLoading: incomeLoading } = useQuery<IncomeEntry[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: debts, isLoading: debtsLoading } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const isLoading = incomeLoading || expensesLoading || debtsLoading;

  const totalIncome = income?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  const totalDebt = debts?.reduce((sum, debt) => sum + Number(debt.currentBalance), 0) || 0;
  const netWorth = totalIncome - totalExpenses - totalDebt;

  const expensesByCategory = expenses?.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const expenseCategoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const monthlyData = [
    { month: "Jan", income: 0, expenses: 0 },
    { month: "Feb", income: 0, expenses: 0 },
    { month: "Mar", income: 0, expenses: 0 },
    { month: "Apr", income: 0, expenses: 0 },
    { month: "May", income: 0, expenses: 0 },
    { month: "Jun", income: 0, expenses: 0 },
    { month: "Jul", income: 0, expenses: 0 },
    { month: "Aug", income: 0, expenses: 0 },
    { month: "Sep", income: 0, expenses: 0 },
    { month: "Oct", income: 0, expenses: 0 },
    { month: "Nov", income: 0, expenses: 0 },
    { month: "Dec", income: 0, expenses: 0 },
  ];

  income?.forEach((entry) => {
    const month = new Date(entry.date).getMonth();
    if (month >= 0 && month < 12) {
      monthlyData[month].income += Number(entry.amount);
    }
  });

  expenses?.forEach((entry) => {
    const month = new Date(entry.date).getMonth();
    if (month >= 0 && month < 12) {
      monthlyData[month].expenses += Number(entry.amount);
    }
  });

  const netWorthData = monthlyData.map((data, index) => ({
    month: data.month,
    netWorth: monthlyData.slice(0, index + 1).reduce((sum, d) => sum + d.income - d.expenses, 0),
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const hasData = (income && income.length > 0) || (expenses && expenses.length > 0) || (debts && debts.length > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon={Wallet}
        title="Welcome to FinanceFlow"
        description="Start tracking your finances by adding income, expenses, or debts. Your financial insights will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Financial Overview</h1>
        <p className="text-sm text-muted-foreground">Your complete financial snapshot</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Income"
          value={`$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconColor="text-green-600"
          trend={{ value: 12.5, label: "vs last month" }}
        />
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Receipt}
          iconColor="text-orange-600"
          trend={{ value: -5.2, label: "vs last month" }}
        />
        <StatCard
          title="Total Debt"
          value={`$${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CreditCard}
          iconColor="text-red-600"
        />
        <StatCard
          title="Net Worth"
          value={`$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={PiggyBank}
          iconColor={netWorth >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {expenseCategoryData.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={expenseCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Net Worth Progression</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={netWorthData}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Area type="monotone" dataKey="netWorth" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorNetWorth)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
