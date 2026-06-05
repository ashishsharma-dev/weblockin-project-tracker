import { savePayout } from "@/app/actions";
import { paymentModeOptions } from "@/lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function PayoutForm({ payout, partners }: { payout?: any; partners: { id: string; name: string }[] }) {
  return (
    <form action={savePayout} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" defaultValue={payout?.id} />
      <div className="space-y-2 md:col-span-2">
        <Label>Partner</Label>
        <select name="partnerId" defaultValue={payout?.partnerId ?? ""} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input name="date" type="date" defaultValue={payout?.date?.toISOString().slice(0, 10)} required />
      </div>
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input name="amount" type="number" defaultValue={payout?.amount?.toString() ?? ""} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Payment Mode</Label>
        <select name="paymentMode" defaultValue={payout?.paymentMode ?? "BANK_TRANSFER"} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {paymentModeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Remarks</Label>
        <Textarea name="remarks" defaultValue={payout?.remarks ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{payout ? "Update Payout" : "Create Payout"}</Button>
      </div>
    </form>
  );
}
