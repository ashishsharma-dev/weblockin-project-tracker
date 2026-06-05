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
        <p className="mt-2 text-2xl font-bold">{currency ? formatCurrency(value) : value}</p>
      </CardContent>
    </Card>
  );
}
