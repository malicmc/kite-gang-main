import { Navigation, Wind } from "lucide-react";
import type { WindConditions } from "@/lib/weather";

function suitability(speedKn: number): { label: string; className: string } {
  if (speedKn < 10) return { label: "Zayıf", className: "text-muted-foreground bg-muted" };
  if (speedKn <= 25) return { label: "İdeal", className: "text-emerald-700 bg-emerald-100" };
  return { label: "Kuvvetli", className: "text-amber-700 bg-amber-100" };
}

export function WindWidget({ wind }: { wind: WindConditions | null }) {
  if (!wind) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border border-sky-200 p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
          <Wind className="w-4 h-4 text-sky-500" />
        </div>
        <p className="text-sm text-sky-600">Rüzgar verisi alınamadı</p>
      </div>
    );
  }

  const { label, className } = suitability(wind.windSpeedKn);

  return (
    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl border border-sky-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Rüzgar</p>
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
          <Wind className="w-4 h-4 text-sky-600" />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-heading font-semibold text-sky-900">{Math.round(wind.windSpeedKn)}</p>
        <span className="text-sm text-sky-600">kn</span>
        <Navigation
          className="w-4 h-4 text-sky-500 ml-1"
          style={{ transform: `rotate(${wind.windDirectionDeg + 180}deg)` }}
        />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-sky-600/80">
          {wind.windDirectionLabel}&apos;dan · {Math.round(wind.windGustKn)} kn hamle · {Math.round(wind.temperature)}°C
        </p>
      </div>
      <span className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${className}`}>
        {label}
      </span>
    </div>
  );
}
