import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  description 
}: MetricCardProps) => {
  return (
    <Card className="bg-black border-white/10 shadow-card hover:shadow-elevated transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{value}</p>
              {change && (
                <p className={cn(
                  "text-xs font-medium flex items-center",
                  changeType === "positive" && "text-white",
                  changeType === "negative" && "text-red-500",
                  changeType === "neutral" && "text-white/70"
                )}>
                  {change}
                </p>
              )}
              {description && (
                <p className="text-xs text-white/70">{description}</p>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
            <Icon className="w-6 h-6 text-black" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};