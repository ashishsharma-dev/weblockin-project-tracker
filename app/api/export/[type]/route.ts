import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

async function getRows(type: string, partnerCode?: string) {
  const projectWhere = partnerCode
    ? {
        OR: [
          { leadContributorCodes: { contains: partnerCode } },
          { developerContributorCodes: { contains: partnerCode } }
        ]
      }
    : undefined;

  switch (type) {
    case "projects":
      return prisma.project.findMany({ where: projectWhere });
    case "payments":
      return prisma.payment.findMany({ where: projectWhere ? { project: projectWhere } : undefined, include: { project: true } });
    case "expenses":
      return prisma.expense.findMany({ include: { project: true } });
    case "earnings":
      return prisma.projectPartnerEarning.findMany({
        where: partnerCode ? { partner: { code: partnerCode as any } } : undefined,
        include: { partner: true, project: true }
      });
    case "payouts":
      return prisma.payout.findMany({
        where: partnerCode ? { partner: { code: partnerCode as any } } : undefined,
        include: { partner: true }
      });
    default:
      return [];
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;
  if (session.user.role === "PARTNER" && !["projects", "payments", "earnings", "payouts"].includes(type)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const rows = await getRows(type, session.user.role === "PARTNER" ? session.user.partnerCode : undefined);

  if (format === "excel") {
    const worksheet = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(rows)));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}.xlsx"`
      }
    });
  }

  if (format === "pdf") {
    const doc = new PDFDocument({ margin: 32 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const endPromise = new Promise((resolve) => doc.on("end", resolve));
    doc.fontSize(18).text(`Weblockin - ${type.toUpperCase()}`);
    doc.moveDown();
    JSON.parse(JSON.stringify(rows)).forEach((row: Record<string, unknown>) => {
      doc.fontSize(10).text(JSON.stringify(row, null, 2));
      doc.moveDown();
    });
    doc.end();
    await endPromise;
    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}.pdf"`
      }
    });
  }

  const json = JSON.parse(JSON.stringify(rows));
  const headers = Object.keys(json[0] ?? {});
  const csv = [
    headers.join(","),
    ...json.map((row: Record<string, unknown>) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}.csv"`
    }
  });
}
