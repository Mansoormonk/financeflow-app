import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type DateRangePreset = "all" | "this-month" | "last-month" | "last-3-months" | "this-year" | "custom";

export interface CustomDateRange {
  start: Date;
  end: Date;
}

export interface DateRangeValue {
  preset: DateRangePreset;
  custom?: CustomDateRange;
}

export interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
}

const PRESETS = [
  { value: "all" as const, label: "All Time" },
  { value: "this-month" as const, label: "This Month" },
  { value: "last-month" as const, label: "Last Month" },
  { value: "last-3-months" as const, label: "Last 3 Months" },
  { value: "this-year" as const, label: "This Year" },
  { value: "custom" as const, label: "Custom Range" },
];

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const getDisplayLabel = () => {
    if (value.preset === "custom" && value.custom) {
      return `${format(value.custom.start, "MMM d")} - ${format(value.custom.end, "MMM d, yyyy")}`;
    }
    return PRESETS.find(p => p.value === value.preset)?.label || "All Time";
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setIsOpen(false);
      setIsCustomDialogOpen(true);
      // Initialize with current custom range or defaults
      if (value.custom) {
        setCustomStart(format(value.custom.start, "yyyy-MM-dd"));
        setCustomEnd(format(value.custom.end, "yyyy-MM-dd"));
      } else {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        setCustomStart(format(thirtyDaysAgo, "yyyy-MM-dd"));
        setCustomEnd(format(now, "yyyy-MM-dd"));
      }
    } else {
      onChange({ preset, custom: undefined });
      setIsOpen(false);
    }
  };

  const handleCustomRangeSubmit = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      
      if (start <= end) {
        onChange({
          preset: "custom",
          custom: { start, end }
        });
        setIsCustomDialogOpen(false);
      }
    }
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full md:w-auto gap-2"
          data-testid="button-date-filter"
        >
          <Calendar className="h-4 w-4" />
          <span className="truncate">{getDisplayLabel()}</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border border-border shadow-lg z-50">
              <div className="py-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover-elevate",
                      value.preset === preset.value && "bg-accent text-accent-foreground font-medium"
                    )}
                    data-testid={`option-${preset.value}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent data-testid="dialog-custom-range">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                data-testid="input-custom-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                data-testid="input-custom-end"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomDialogOpen(false)}
              data-testid="button-cancel-custom"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomRangeSubmit}
              disabled={!customStart || !customEnd || new Date(customStart) > new Date(customEnd)}
              data-testid="button-apply-custom"
            >
              Apply Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function getDateRange(value: DateRangeValue): { start: Date | null; end: Date | null } {
  if (value.preset === "custom" && value.custom) {
    return { start: value.custom.start, end: value.custom.end };
  }

  const now = new Date();
  
  switch (value.preset) {
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    }
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start, end };
    }
    case "last-3-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    }
    case "this-year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start, end };
    }
    case "all":
    default:
      return { start: null, end: null };
  }
}

export function filterByDateRange<T extends { date: Date | string }>(
  items: T[],
  value: DateRangeValue
): T[] {
  if (value.preset === "all") return items;
  
  const { start, end } = getDateRange(value);
  if (!start || !end) return items;
  
  return items.filter((item) => {
    // Convert to Date object for comparison (handles both Date and ISO string inputs)
    const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
    // Normalize to midnight for date-only comparisons
    const itemDateMidnight = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    return itemDateMidnight >= start && itemDateMidnight <= end;
  });
}

// URL state helpers
export function serializeDateRange(value: DateRangeValue): string {
  if (value.preset === "custom" && value.custom) {
    return `custom:${format(value.custom.start, "yyyy-MM-dd")},${format(value.custom.end, "yyyy-MM-dd")}`;
  }
  return value.preset;
}

export function parseDateRange(str: string | null): DateRangeValue {
  if (!str) return { preset: "all" };
  
  if (str.startsWith("custom:")) {
    const dates = str.substring(7).split(",");
    if (dates.length === 2) {
      const start = new Date(dates[0]);
      const end = new Date(dates[1]);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return { preset: "custom", custom: { start, end } };
      }
    }
  }
  
  const preset = str as DateRangePreset;
  if (["all", "this-month", "last-month", "last-3-months", "this-year"].includes(preset)) {
    return { preset };
  }
  
  return { preset: "all" };
}
