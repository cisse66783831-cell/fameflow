import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  className?: string;
}

export const StatsCard = ({ icon, label, value, trend, className }: StatsCardProps) => {
  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 animate-scale-in",
      "hover:shadow-card transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-display font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
};
