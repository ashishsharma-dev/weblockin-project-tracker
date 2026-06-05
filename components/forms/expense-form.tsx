import { saveExpense } from "@/app/actions";
import { expenseCategoryOptions } from "@/lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function ExpenseForm({ expense, projects }: { expense?: any; projects: { id: string; name: string }[] }) {
  return (
    <form action={saveExpense} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" defaultValue={expense?.id} />
      <div className="space-y-2">
        <Label>Title</Label>
        <Input name="title" defaultValue={expense?.title} required />
      </div>
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input name="amount" type="number" defaultValue={expense?.amount?.toString() ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input name="date" type="date" defaultValue={expense?.date?.toISOString().slice(0, 10)} required />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <select name="category" defaultValue={expense?.category ?? "HOSTING"} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {expenseCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Related Project</Label>
        <select name="projectId" defaultValue={expense?.projectId ?? ""} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          <option value="">Not linked</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Notes</Label>
        <Textarea name="notes" defaultValue={expense?.notes ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{expense ? "Update Expense" : "Create Expense"}</Button>
      </div>
    </form>
  );
}
