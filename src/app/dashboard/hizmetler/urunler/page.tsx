import { requireAdminOrReception } from "@/lib/auth";
import { SablonTable } from "../sablon-table";

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aktif?: string; gorunurluk?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  return <SablonTable category="URUN" label="Satılabilir Ürün" itemLabel="Ürün" searchParams={params} />;
}
