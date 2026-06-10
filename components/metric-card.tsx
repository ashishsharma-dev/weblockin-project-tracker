import { Card, CardContent } from "./ui/card";
import { formatCurrency } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  currency
}: {
  label: string;
  value: number;
  currency?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-0.5 text-2xl font-bold">
          {currency ? (
            <>
              <span className="text-lg font-semibold text-muted-foreground pl-0.5 select-none">₹</span>
              <span>{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}</span>
            </>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
