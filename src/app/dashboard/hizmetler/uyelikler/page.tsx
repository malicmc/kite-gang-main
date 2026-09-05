import { requireAdminOrReception } from "@/lib/auth";
import { SablonTable } from "../sablon-table";

export default async function UyeliklerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aktif?: string; gorunurluk?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  return <SablonTable category="UYELIK" label="Üyelik" itemLabel="Üyelik" searchParams={params} />;
}
