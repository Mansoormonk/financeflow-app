import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import type { IncomeEntry, Expense, Debt } from "@shared/schema";

export default function Reports() {
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
  const netProfit = totalIncome - totalExpenses;
  const netWorth = totalIncome - totalExpenses - totalDebt;

  const incomeByCategory = income?.reduce((acc, entry) => {
    const category = entry.category;
    acc[category] = (acc[category] || 0) + Number(entry.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const expensesByCategory = expenses?.reduce((acc, entry) => {
    const category = entry.category;
    acc[category] = (acc[category] || 0) + Number(entry.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const hasData = (income && income.length > 0) || (expenses && expenses.length > 0) || (debts && debts.length > 0);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Reports</h1>
          <p className="text-sm text-muted-foreground">Financial statements and analysis</p>
        </div>
        <EmptyState
          icon={FileText}
          title="No data to report"
          description="Add income, expenses, or debts to generate your financial reports."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Reports</h1>
        <p className="text-sm text-muted-foreground">Financial statements and analysis</p>
      </div>

      <Tabs defaultValue="pl" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pl" data-testid="tab-profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance" data-testid="tab-balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profit & Loss Statement</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h3 className="font-semibold text-green-600">Income</h3>
                  <span className="font-semibold text-green-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(incomeByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{category}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h3 className="font-semibold text-orange-600">Expenses</h3>
                  <span className="font-semibold text-orange-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{category}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Net Profit/Loss</h3>
                    {netProfit >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <span
                    className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    data-testid="net-profit"
                  >
                    {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Balance Sheet</h2>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h3 className="font-semibold text-green-600">Assets</h3>
                  <span className="font-semibold text-green-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Income (Cash)</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                  <h3 className="font-semibold text-red-600">Liabilities</h3>
                  <span className="font-semibold text-red-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${(totalExpenses + totalDebt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Expenses</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Debt</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Net Worth</h3>
                    {netWorth >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <span
                    className={`text-xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    data-testid="net-worth"
                  >
                    {netWorth >= 0 ? '+' : ''}${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Assets - Liabilities = Net Worth
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Debt Summary</h3>
            {debts && debts.length > 0 ? (
              <div className="space-y-3">
                {debts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{debt.creditorName}</p>
                      <p className="text-xs text-muted-foreground">{debt.debtType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ${Number(debt.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(debt.interestRate).toFixed(2)}% APR
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No debts recorded</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
