import Link from "next/link";
import { deleteTask, updateTaskStatus } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { TaskForm } from "@/components/forms/task-form";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { auth } from "@/auth";
import { AddEntryDialog } from "@/components/add-entry-dialog";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; assignee?: string; project?: string; view?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const view = params.view || "list";

  // Query projects and users for selection
  const [projects, users] = await Promise.all([
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  // Build task query filters
  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.assignee) where.assignedToId = params.assignee;
  if (params.project) where.projectId = params.project;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: true,
      assignedTo: true,
      createdBy: true
    },
    orderBy: { dueDate: "asc" }
  });

  const columns = [
    { title: "Pending", status: "PENDING", bg: "bg-muted/30", border: "border-muted-foreground/20", text: "text-muted-foreground" },
    { title: "In Progress", status: "IN_PROGRESS", bg: "bg-blue-50/50 dark:bg-blue-950/10", border: "border-blue-200 dark:border-blue-900/50", text: "text-blue-600 dark:text-blue-400" },
    { title: "Completed", status: "COMPLETED", bg: "bg-green-50/50 dark:bg-green-950/10", border: "border-green-200 dark:border-green-900/50", text: "text-green-600 dark:text-green-400" },
    { title: "Cancelled", status: "CANCELLED", bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Task Board" description="Assign deliverables, set task deadlines, and monitor completion progress.">
        <AddEntryDialog title="Assign New Task" buttonText="Add Task">
          <TaskForm projects={projects} users={users} />
        </AddEntryDialog>
      </PageHeader>


      {/* Filters & View Switcher */}
      <DataTableCard title="Filters & View Options" description="Filter tasks or switch between Table and Kanban Board layout.">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/tasks?${buildQueryString({ ...params, view: "list" })}`}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  view === "list" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                }`}
              >
                Table List
              </Link>
              <Link
                href={`/tasks?${buildQueryString({ ...params, view: "board" })}`}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  view === "board" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                }`}
              >
                Status Board (Kanban)
              </Link>
            </div>
            <Link href="/tasks" className="rounded-xl border px-3 py-1.5 text-xs hover:bg-muted font-semibold">
              Reset Filters
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground block">Status</span>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={`/tasks?${buildQueryString({ ...params, status: "" })}`}
                  className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                    !params.status ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </Link>
                {columns.map((col) => (
                  <Link
                    key={col.status}
                    href={`/tasks?${buildQueryString({ ...params, status: col.status })}`}
                    className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                      params.status === col.status ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {col.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground block">Project</span>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                <Link
                  href={`/tasks?${buildQueryString({ ...params, project: "" })}`}
                  className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                    !params.project ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All Projects
                </Link>
                {projects.map((proj) => {
                  const active = params.project === proj.id;
                  return (
                    <Link
                      key={proj.id}
                      href={`/tasks?${buildQueryString({ ...params, project: proj.id })}`}
                      className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                        active ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {proj.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Assignee Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground block">Assignee</span>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                <Link
                  href={`/tasks?${buildQueryString({ ...params, assignee: "" })}`}
                  className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                    !params.assignee ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All Assignees
                </Link>
                {users.map((user) => {
                  const active = params.assignee === user.id;
                  return (
                    <Link
                      key={user.id}
                      href={`/tasks?${buildQueryString({ ...params, assignee: user.id })}`}
                      className={`rounded-xl border px-2.5 py-1 text-xs transition ${
                        active ? "bg-secondary text-secondary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DataTableCard>

      {/* Main Content View */}
      {view === "list" ? (
        <DataTableCard title="Active Tasks">
          {tasks.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{task.project?.name ?? "General"}</TableCell>
                    <TableCell>{task.assignedTo.name}</TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={
                        task.status === "COMPLETED" ? "bg-green-600/10 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-900/50" :
                        task.status === "IN_PROGRESS" ? "bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50" :
                        task.status === "CANCELLED" ? "bg-red-600/10 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-900/50" :
                        "bg-muted text-muted-foreground border"
                      }>
                        {task.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.createdBy.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${task.id}`}>Edit</Link>
                        </Button>
                        <form action={deleteTask.bind(null, task.id)}>
                          <DeleteButton />
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No tasks found matching your filters.
            </div>
          )}
        </DataTableCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[450px]`}>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className={`font-bold text-sm ${col.text}`}>{col.title}</h3>
                  <Badge className={`${col.border} ${col.text} bg-background font-bold border`}>
                    {colTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" && task.status !== "CANCELLED";
                    return (
                      <div key={task.id} className="rounded-xl border bg-background p-3 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                        <div>
                          <h4 className="font-bold text-sm tracking-tight">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground border">
                            {task.project?.name ?? "General"}
                          </Badge>
                          {task.dueDate && (
                            <Badge className={`text-[10px] px-1.5 py-0.5 font-semibold border ${
                              isOverdue
                                ? "bg-red-600/10 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50"
                                : "bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                            }`}>
                              Due: {formatDate(task.dueDate)}
                            </Badge>
                          )}
                        </div>

                        <div className="text-[10px] text-muted-foreground border-t pt-2 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Assignee:</span>
                            <span className="font-semibold text-foreground">{task.assignedTo.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>By:</span>
                            <span className="font-medium">{task.createdBy.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 border-t pt-2">
                          <Link href={`/tasks/${task.id}`} className="rounded-lg border px-2 py-1 text-[10px] font-semibold hover:bg-muted transition-colors">
                            Edit
                          </Link>
                          <form action={deleteTask.bind(null, task.id)} className="inline">
                            <DeleteButton label="Delete" />
                          </form>
                        </div>

                        {/* Status Transitions */}
                        <div className="grid grid-cols-2 gap-1.5 border-t pt-2">
                          {task.status !== "COMPLETED" && (
                            <form action={updateTaskStatus.bind(null, task.id, "COMPLETED")}>
                              <button type="submit" className="w-full text-center rounded-lg bg-green-600 dark:bg-green-700 text-white text-[10px] font-bold py-1 hover:opacity-90">
                                Complete ✓
                              </button>
                            </form>
                          )}
                          {task.status === "PENDING" && (
                            <form action={updateTaskStatus.bind(null, task.id, "IN_PROGRESS")}>
                              <button type="submit" className="w-full text-center rounded-lg bg-blue-600 dark:bg-blue-700 text-white text-[10px] font-bold py-1 hover:opacity-90">
                                Start →
                              </button>
                            </form>
                          )}
                          {task.status === "IN_PROGRESS" && (
                            <form action={updateTaskStatus.bind(null, task.id, "PENDING")}>
                              <button type="submit" className="w-full text-center rounded-lg border text-[10px] font-semibold py-1 hover:bg-muted">
                                Pause
                              </button>
                            </form>
                          )}
                          {task.status !== "CANCELLED" && (
                            <form action={updateTaskStatus.bind(null, task.id, "CANCELLED")}>
                              <button type="submit" className="w-full text-center rounded-lg border text-[10px] font-semibold py-1 hover:bg-muted text-destructive">
                                Cancel
                              </button>
                            </form>
                          )}
                          {task.status === "CANCELLED" && (
                            <form action={updateTaskStatus.bind(null, task.id, "PENDING")}>
                              <button type="submit" className="w-full text-center rounded-lg border text-[10px] font-semibold py-1 hover:bg-muted">
                                Restore
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildQueryString(params: any) {
  return Object.entries(params)
    .filter(([_, val]) => val !== undefined && val !== null && val !== "")
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
}

