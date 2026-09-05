import { SatisTabs } from "./satis-tabs";

export default function SatislarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Satışlar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Paket, üyelik ve ürün satışlarının tamamı burada listelenir.
        </p>
      </div>
      <SatisTabs />
      {children}
    </div>
  );
}
