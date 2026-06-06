import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { TaskForm } from "@/components/forms/task-form";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) notFound();

  const { id } = await params;

  const [task, projects, users] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Task" description="Update task title, assign details, due dates, or status." />
      <DataTableCard title="Task Details">
        <TaskForm task={task} projects={projects} users={users} />
      </DataTableCard>
    </div>
  );
}
