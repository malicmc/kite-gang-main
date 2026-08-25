import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MakbuzDocument } from "@/lib/makbuz-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTION")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: { select: { firstName: true, lastName: true } },
      hizmet: { select: { title: true } },
    },
  });

  if (!payment || payment.direction !== "INCOMING") {
    return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    MakbuzDocument({
      data: {
        receiptNo: payment.id.slice(-8).toUpperCase(),
        recordedAt: payment.recordedAt,
        customerName: payment.student
          ? `${payment.student.firstName} ${payment.student.lastName}`
          : "Genel Müşteri",
        description: payment.hizmet?.title ?? payment.description ?? "Ödeme",
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
      },
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="makbuz-${payment.id.slice(-8)}.pdf"`,
    },
  });
}
