import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { ProjectForm } from "@/components/forms/project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") notFound();
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Project" description="Adjust project details and recalculate partner splits safely on the server." />
      <DataTableCard title={project.name}>
        <ProjectForm project={project} />
      </DataTableCard>
    </div>
  );
}
