import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, CreditCard, Calendar, Trash2, DollarSign, Percent, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { DateRangeFilter, filterByDateRange, serializeDateRange, parseDateRange, type DateRangeValue } from "@/components/date-range-filter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertDebtSchema, insertDebtPaymentSchema, DEBT_TYPES } from "@shared/schema";
import type { Debt, InsertDebt, InsertDebtPayment, DebtPayment } from "@shared/schema";
import { format } from "date-fns";

export default function Debts() {
  const [location, setLocation] = useLocation();
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => 
    parseDateRange(searchParams.get('range'))
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip URL update on first render - we just initialized from URL
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const params = new URLSearchParams();
    const serialized = serializeDateRange(dateRange);
    if (serialized !== "all") {
      params.set('range', serialized);
    }
    const newSearch = params.toString();
    const newPath = newSearch ? `/debts?${newSearch}` : '/debts';
    setLocation(newPath, { replace: true });
  }, [dateRange, setLocation]);
  const { toast } = useToast();

  const { data: debts, isLoading } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const { data: payments } = useQuery<DebtPayment[]>({
    queryKey: ["/api/debt-payments"],
  });

  const debtForm = useForm<InsertDebt>({
    resolver: zodResolver(insertDebtSchema),
    defaultValues: {
      creditorName: "",
      principalAmount: 0,
      currentBalance: 0,
      interestRate: 0,
      debtType: "Credit Card",
      dueDate: undefined,
    },
  });

  const paymentForm = useForm<InsertDebtPayment>({
    resolver: zodResolver(insertDebtPaymentSchema),
    defaultValues: {
      debtId: "",
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
    },
  });

  const createDebtMutation = useMutation({
    mutationFn: async (data: InsertDebt) => {
      return apiRequest("POST", "/api/debts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      setIsDebtDialogOpen(false);
      debtForm.reset();
      toast({
        title: "Debt added",
        description: "Your debt has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertDebtPayment) => {
      return apiRequest("POST", "/api/debt-payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/debt-payments"] });
      setIsPaymentDialogOpen(false);
      setSelectedDebtId(null);
      paymentForm.reset();
      toast({
        title: "Payment recorded",
        description: "Your debt payment has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/debts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      toast({
        title: "Debt deleted",
        description: "The debt has been removed.",
      });
    },
  });

  const onSubmitDebt = (data: InsertDebt) => {
    createDebtMutation.mutate(data);
  };

  const onSubmitPayment = (data: InsertDebtPayment) => {
    createPaymentMutation.mutate(data);
  };

  const openPaymentDialog = (debtId: string) => {
    setSelectedDebtId(debtId);
    paymentForm.setValue("debtId", debtId);
    setIsPaymentDialogOpen(true);
  };

  const debtsWithDate = debts?.map(debt => ({ ...debt, date: debt.createdAt })) || [];
  const filteredDebts = filterByDateRange(debtsWithDate, dateRange);
  const totalDebt = filteredDebts.reduce((sum, debt) => sum + Number(debt.currentBalance), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">Debts</h1>
          <p className="text-sm text-muted-foreground">Manage your liabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full" data-testid="button-add-debt">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Debt</DialogTitle>
            </DialogHeader>
            <Form {...debtForm}>
              <form onSubmit={debtForm.handleSubmit(onSubmitDebt)} className="space-y-4">
                <FormField
                  control={debtForm.control}
                  name="creditorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creditor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chase Bank" {...field} data-testid="input-creditor-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={debtForm.control}
                  name="debtType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-debt-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEBT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={debtForm.control}
                  name="principalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-principal-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={debtForm.control}
                  name="currentBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-current-balance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={debtForm.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-interest-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={debtForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-due-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createDebtMutation.isPending} data-testid="button-submit-debt">
                  {createDebtMutation.isPending ? "Adding..." : "Add Debt"}
                </Button>
              </form>
            </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-600/10">
            <CreditCard className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      {!debts || debts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No debts tracked"
          description="Start managing your liabilities by adding your first debt."
          actionLabel="Add Debt"
          onAction={() => setIsDebtDialogOpen(true)}
        />
      ) : filteredDebts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No entries in this period"
          description="Try selecting a different date range to see your debts."
        />
      ) : (
        <div className="space-y-4">
          {filteredDebts.map((debt) => {
            const paymentProgress = ((Number(debt.principalAmount) - Number(debt.currentBalance)) / Number(debt.principalAmount)) * 100;
            
            return (
              <Card key={debt.id} className="p-6 hover-elevate" data-testid={`debt-entry-${debt.id}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{debt.creditorName}</h3>
                      <p className="text-sm text-muted-foreground">{debt.debtType}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDebtMutation.mutate(debt.id)}
                      disabled={deleteDebtMutation.isPending}
                      data-testid={`button-delete-debt-${debt.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                      <p className="text-xl font-semibold text-red-600" style={{ fontVariantNumeric: 'tabular-nums' }} data-testid={`debt-balance-${debt.id}`}>
                        ${Number(debt.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                      <p className="text-xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {Number(debt.interestRate).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Payment Progress</span>
                      <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={paymentProgress} className="h-2" />
                  </div>

                  {debt.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Due: {format(new Date(debt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openPaymentDialog(debt.id)}
                    data-testid={`button-add-payment-${debt.id}`}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Debt Payment</DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-payment-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-payment-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createPaymentMutation.isPending} data-testid="button-submit-payment">
                {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
