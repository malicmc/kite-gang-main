import { requireAdminOrReception } from "@/lib/auth";
import { SablonTable } from "../sablon-table";

export default async function SeanslarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aktif?: string; gorunurluk?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  return <SablonTable category="EGITIM" label="Seanslar" itemLabel="Seans" searchParams={params} />;
}
