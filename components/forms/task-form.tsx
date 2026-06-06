import { saveTask } from "@/app/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function TaskForm({
  task,
  projects,
  users
}: {
  task?: any;
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
}) {
  return (
    <form action={saveTask} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" defaultValue={task?.id} />

      <div className="space-y-2 md:col-span-2">
        <Label>Task Title</Label>
        <Input name="title" defaultValue={task?.title} required />
      </div>

      <div className="space-y-2">
        <Label>Assigned To</Label>
        <select name="assignedToId" defaultValue={task?.assignedToId ?? ""} className="h-10 w-full rounded-xl border bg-background px-3 text-sm" required>
          <option value="" disabled>Select team member</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Related Project</Label>
        <select name="projectId" defaultValue={task?.projectId ?? ""} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          <option value="">General (None)</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Input name="dueDate" type="date" defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""} />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <select name="status" defaultValue={task?.status ?? "PENDING"} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={task?.description ?? ""} />
      </div>

      <div className="md:col-span-2">
        <Button type="submit">{task ? "Update Task" : "Assign Task"}</Button>
      </div>
    </form>
  );
}
