import Link from "next/link";
import { saveLeadSheet, uploadResponseSheet, deleteLeadSheet } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DataTableCard } from "@/components/data-table-card";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { auth } from "@/auth";
import { AddEntryDialog } from "@/components/add-entry-dialog";
import { Download, Upload, FileSpreadsheet, Target, Plus, Calendar, User, FileText, CheckCircle2, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function LeadsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const currentUserId = session?.user?.id;

  // Build filter based on role
  const where: any = {};
  if (!isAdmin && currentUserId) {
    where.assignedToId = currentUserId;
  }

  const [leadSheets, users] = await Promise.all([
    prisma.leadSheet.findMany({
      where,
      include: {
        assignedTo: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leads Management" 
        description={
          isAdmin 
            ? "Upload leads sheets, assign them to your team members, and download completed response sheets." 
            : "View assigned leads sheets, download target files, and upload response sheets after completion."
        }
      >
        {isAdmin && (
          <AddEntryDialog title="Assign New Leads Sheet" buttonText="Assign Leads">
            <form action={saveLeadSheet} className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Leads Sheet Name</Label>
                <Input id="name" name="name" placeholder="e.g. Q2 Real Estate Leads" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedToId">Assign To Employee</Label>
                <select 
                  id="assignedToId" 
                  name="assignedToId" 
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm" 
                  required
                >
                  <option value="" disabled selected>Select employee</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Instructions</Label>
                <Textarea id="notes" name="notes" placeholder="Specify any guidelines for doing these leads..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="givenFile">Given Leads Sheet (CSV/XLSX)</Label>
                <Input 
                  id="givenFile" 
                  name="givenFile" 
                  type="file" 
                  accept=".csv, .xlsx, .xls" 
                  required 
                  className="cursor-pointer"
                />
              </div>

              <div className="mt-2">
                <Button type="submit" className="w-full">Upload & Assign Sheet</Button>
              </div>
            </form>
          </AddEntryDialog>
        )}
      </PageHeader>

      <DataTableCard title="Leads Sheets Registers" description="Track given files and reuploaded responses.">
        {leadSheets.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sheet Name</TableHead>
                  {isAdmin && <TableHead>Assigned To</TableHead>}
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Given Sheet</TableHead>
                  <TableHead>Employee Response Sheet</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-20">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadSheets.map((sheet) => {
                  const isAssignee = sheet.assignedToId === currentUserId;
                  return (
                    <TableRow key={sheet.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                            {sheet.name}
                          </p>
                          {sheet.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs" title={sheet.notes}>
                              {sheet.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      {isAdmin && (
                        <TableCell>
                          <span className="font-medium text-sm flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {sheet.assignedTo.name}
                          </span>
                        </TableCell>
                      )}

                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(sheet.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Button variant="outline" size="sm" asChild className="rounded-xl border shadow-sm">
                          <Link href={sheet.givenSheetUrl} download={sheet.givenSheetName} className="flex items-center gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            <span className="max-w-[120px] truncate">{sheet.givenSheetName}</span>
                          </Link>
                        </Button>
                      </TableCell>

                      <TableCell>
                        {sheet.responseSheetUrl ? (
                          <Button variant="outline" size="sm" asChild className="rounded-xl border shadow-sm">
                            <Link href={sheet.responseSheetUrl} download={sheet.responseSheetName} className="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                              <Download className="h-3.5 w-3.5" />
                              <span className="max-w-[120px] truncate">{sheet.responseSheetName}</span>
                            </Link>
                          </Button>
                        ) : isAssignee ? (
                          <form action={uploadResponseSheet} className="flex items-center gap-2">
                            <input type="hidden" name="leadSheetId" value={sheet.id} />
                            <input 
                              type="file" 
                              name="responseFile" 
                              required 
                              className="hidden" 
                              id={`response-file-${sheet.id}`} 
                              accept=".csv, .xlsx, .xls"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  e.target.form?.requestSubmit();
                                }
                              }} 
                            />
                            <label 
                              htmlFor={`response-file-${sheet.id}`} 
                              className="rounded-xl border px-3 py-1.5 text-xs hover:bg-muted font-semibold cursor-pointer transition flex items-center gap-1.5 bg-background text-primary"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Upload Response
                            </label>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Awaiting upload
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={
                          sheet.status === "COMPLETED" 
                            ? "bg-green-600/10 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center gap-1 w-fit" 
                            : "bg-amber-600/10 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 w-fit"
                        }>
                          {sheet.status === "COMPLETED" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 shrink-0" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {isAdmin && (
                        <TableCell>
                          <form action={deleteLeadSheet.bind(null, sheet.id)}>
                            <DeleteButton />
                          </form>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-2xl">
            <Target className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            No leads sheets found.
          </div>
        )}
      </DataTableCard>
    </div>
  );
}
