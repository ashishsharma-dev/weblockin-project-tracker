import { Badge } from "./ui/badge";

export function PageHeader({
  title,
  description,
  badge,
  children
}: {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {badge ? <Badge>{badge}</Badge> : null}
        {children}
      </div>
    </div>
  );
}

