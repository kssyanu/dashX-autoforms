import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  format: "currency" | "number" | "percentage";
  description?: string;
  trend?: number;
}

export function MetricCard({
  title,
  value,
  format,
  description,
  trend = 0,
}: MetricCardProps) {
  const formattedValue =
    format === "currency"
      ? formatCurrency(value)
      : format === "percentage"
      ? formatPercentage(value)
      : formatNumber(value);

  const trendIcon =
    trend > 0 ? (
      <ArrowUp className="h-4 w-4 text-green-500" />
    ) : trend < 0 ? (
      <ArrowDown className="h-4 w-4 text-red-500" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  const trendColor =
    trend > 0
      ? "text-green-500"
      : trend < 0
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== 0 && (
          <div className="flex items-center mt-2 text-xs">
            {trendIcon}
            <span className={`ml-1 ${trendColor}`}>
              {Math.abs(trend)}% vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
