import { requireAdminOrReception } from "@/lib/auth";
import { SablonTable } from "../sablon-table";

export default async function KiralamalarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aktif?: string; gorunurluk?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  return <SablonTable category="KIRALAMA" label="Kiralamalar" itemLabel="Kiralama" searchParams={params} />;
}
