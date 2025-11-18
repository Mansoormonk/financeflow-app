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
  RadialBarChart,
  RadialBar,
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

  // Financial Health Score Calculation
  const calculateHealthScore = () => {
    if (totalIncome === 0) return 0;
    
    // Factor 1: Expense Ratio (40% weight) - Lower is better
    const expenseRatio = totalExpenses / totalIncome;
    const expenseScore = Math.max(0, Math.min(100, (1 - expenseRatio) * 100)) * 0.4;
    
    // Factor 2: Debt to Income Ratio (35% weight) - Lower is better
    const debtRatio = totalDebt / totalIncome;
    const debtScore = Math.max(0, Math.min(100, (1 - Math.min(debtRatio, 2) / 2) * 100)) * 0.35;
    
    // Factor 3: Savings Rate (25% weight) - Higher is better
    const savingsRate = (totalIncome - totalExpenses) / totalIncome;
    const savingsScore = Math.max(0, Math.min(100, savingsRate * 100)) * 0.25;
    
    return Math.round(expenseScore + debtScore + savingsScore);
  };

  const healthScore = calculateHealthScore();
  
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "hsl(var(--chart-1))", textColor: "text-green-600" };
    if (score >= 60) return { label: "Good", color: "hsl(var(--chart-2))", textColor: "text-blue-600" };
    if (score >= 40) return { label: "Fair", color: "hsl(var(--chart-4))", textColor: "text-yellow-600" };
    return { label: "Poor", color: "hsl(var(--chart-5))", textColor: "text-red-600" };
  };

  const healthStatus = getHealthStatus(healthScore);

  const getRecommendations = () => {
    const recommendations: string[] = [];
    const expenseRatio = totalExpenses / totalIncome;
    const debtRatio = totalDebt / totalIncome;
    const savingsRate = (totalIncome - totalExpenses) / totalIncome;

    if (expenseRatio > 0.7) {
      recommendations.push("Your expenses are high. Consider reducing discretionary spending.");
    }
    if (debtRatio > 0.5) {
      recommendations.push("Focus on paying down debt to improve your financial health.");
    }
    if (savingsRate < 0.2) {
      recommendations.push("Try to save at least 20% of your income each month.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Great job! You're managing your finances well.");
    }
    return recommendations;
  };

  const recommendations = getRecommendations();

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

      <Card className="p-6" data-testid="card-health-score">
        <h3 className="text-lg font-semibold mb-4">Financial Health Score</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={20}
                data={[{ name: "Health", value: healthScore, fill: healthStatus.color }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-4xl font-bold"
                  data-testid="text-health-score"
                >
                  {healthScore}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-sm font-semibold ${healthStatus.textColor}`}
                  data-testid="text-health-status"
                >
                  {healthStatus.label}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Recommendations</h4>
              <ul className="space-y-2" data-testid="list-recommendations">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Based on your expense ratio, debt-to-income ratio, and savings rate
              </p>
            </div>
          </div>
        </div>
      </Card>

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
