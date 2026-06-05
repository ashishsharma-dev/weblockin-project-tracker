import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Add records to start seeing analytics and payout insights here.</CardContent>
    </Card>
  );
}
