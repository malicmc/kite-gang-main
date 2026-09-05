import { requireAdminOrReception } from "@/lib/auth";
import { SablonTable } from "../sablon-table";

export default async function EtkinliklerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aktif?: string; gorunurluk?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  return <SablonTable category="ETKINLIK" label="Etkinlik" itemLabel="Etkinlik" searchParams={params} />;
}
