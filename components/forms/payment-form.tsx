import { savePayment } from "@/app/actions";
import { paymentModeOptions } from "@/lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function PaymentForm({ payment, projects }: { payment?: any; projects: { id: string; name: string }[] }) {
  return (
    <form action={savePayment} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" defaultValue={payment?.id} />
      <div className="space-y-2 md:col-span-2">
        <Label>Project</Label>
        <select name="projectId" defaultValue={payment?.projectId ?? ""} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Payment Date</Label>
        <Input name="paymentDate" type="date" defaultValue={payment?.paymentDate?.toISOString().slice(0, 10)} required />
      </div>
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input name="amount" type="number" defaultValue={payment?.amount?.toString() ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label>Payment Mode</Label>
        <select name="paymentMode" defaultValue={payment?.paymentMode ?? "BANK_TRANSFER"} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {paymentModeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Transaction ID</Label>
        <Input name="transactionId" defaultValue={payment?.transactionId ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Notes</Label>
        <Textarea name="notes" defaultValue={payment?.notes ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{payment ? "Update Payment" : "Create Payment"}</Button>
      </div>
    </form>
  );
}
