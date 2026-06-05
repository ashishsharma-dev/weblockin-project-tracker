import { saveProject } from "@/app/actions";
import { projectStatusOptions } from "@/lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function ProjectForm({ project }: { project?: any }) {
  return (
    <form action={saveProject} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" defaultValue={project?.id} />
      <div className="space-y-2">
        <Label>Project Name</Label>
        <Input name="name" defaultValue={project?.name} required />
      </div>
      <div className="space-y-2">
        <Label>Client Name</Label>
        <Input name="clientName" defaultValue={project?.clientName} required />
      </div>
      <div className="space-y-2">
        <Label>Client Email</Label>
        <Input name="clientEmail" type="email" defaultValue={project?.clientEmail ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>Client Phone</Label>
        <Input name="clientPhone" defaultValue={project?.clientPhone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>Project Value</Label>
        <Input name="projectValue" type="number" defaultValue={project?.projectValue?.toString() ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select name="status" defaultValue={project?.status ?? "LEAD_RECEIVED"} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          {projectStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Lead Contributors</Label>
        <div className="flex gap-4 rounded-xl border p-3">
          {["Ankit", "Mahrishi"].map((partner) => (
            <label key={partner} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="leadContributorCodes" value={partner} defaultChecked={project?.leadContributorCodes?.includes(partner)} />
              {partner}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Developer Contributors</Label>
        <div className="flex gap-4 rounded-xl border p-3">
          {["Ashish", "Kush"].map((partner) => (
            <label key={partner} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="developerContributorCodes" value={partner} defaultChecked={project?.developerContributorCodes?.includes(partner)} />
              {partner}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input name="startDate" type="date" defaultValue={project?.startDate?.toISOString().slice(0, 10)} />
      </div>
      <div className="space-y-2">
        <Label>Delivery Date</Label>
        <Input name="deliveryDate" type="date" defaultValue={project?.deliveryDate?.toISOString().slice(0, 10)} />
      </div>
      <div className="space-y-2">
        <Label>Payment Due Date</Label>
        <Input name="paymentDueDate" type="date" defaultValue={project?.paymentDueDate?.toISOString().slice(0, 10)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={project?.description ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Notes</Label>
        <Textarea name="notes" defaultValue={project?.notes ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{project ? "Update Project" : "Create Project"}</Button>
      </div>
    </form>
  );
}
