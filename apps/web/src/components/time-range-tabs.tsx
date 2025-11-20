import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeRange } from "@top-github-repos/api/types/repos";

const timeRanges: { value: TimeRange; label: string; path: string }[] = [
  { value: 'daily', label: 'Daily', path: '/daily' },
  { value: 'weekly', label: 'Weekly', path: '/weekly' },
  { value: 'monthly', label: 'Monthly', path: '/monthly' },
  { value: 'yearly', label: 'Yearly', path: '/yearly' },
];

interface TimeRangeTabsProps {
  currentRange: TimeRange;
  className?: string;
}

export default function TimeRangeTabs({ currentRange, className }: TimeRangeTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn("flex gap-2", className)} role="tablist" aria-label="Time range selection">
      {timeRanges.map((range) => {
        const isActive = currentRange === range.value || 
          (range.value === 'daily' && currentPath === '/');
        
        return (
          <Link
            key={range.value}
            to={range.path}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${range.value}-panel`}
            tabIndex={isActive ? 0 : -1}
          >
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-colors",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              {range.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

