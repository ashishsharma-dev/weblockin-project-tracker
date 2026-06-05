import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { ProjectForm } from "@/components/forms/project-form";
import { deleteProject } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/auth";
import { getScopedProjects } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await getScopedProjects();

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Track delivery, collections, and automated profit splits project by project." />
      {session?.user.role === "ADMIN" ? (
        <DataTableCard title="Create Project" description="Server-side profit calculations run automatically whenever a project changes.">
          <ProjectForm />
        </DataTableCard>
      ) : null}
      <DataTableCard title="Project Register">
        {projects.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Net Profit</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>Delivery</TableHead>
                {session?.user.role === "ADMIN" ? <TableHead>Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.clientName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{project.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(project.projectValue.toString())}</TableCell>
                  <TableCell>{formatCurrency(project.expensesTotal.toString())}</TableCell>
                  <TableCell>{formatCurrency(project.netProfit.toString())}</TableCell>
                  <TableCell>{formatCurrency(project.amountPending.toString())}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>Lead: {project.leadContributorCodes}</p>
                      <p>Dev: {project.developerContributorCodes}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(project.deliveryDate)}</TableCell>
                  {session?.user.role === "ADMIN" ? (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${project.id}`}>Edit</Link>
                        </Button>
                        <form action={deleteProject.bind(null, project.id)}>
                          <DeleteButton />
                        </form>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState title="No projects yet" description="Create your first project to start tracking revenue, payouts, and profit sharing." />
        )}
      </DataTableCard>
    </div>
  );
}
