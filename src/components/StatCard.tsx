"use client";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
}

export default function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {subtitle ? (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          ) : null}
          {trend ? (
            <p
              className={`text-xs mt-1.5 font-medium ${
                trend.direction === "down"
                  ? "text-emerald-600"
                  : trend.direction === "up"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {trend.direction === "down" && "↓ "}
              {trend.direction === "up" && "↑ "}
              {trend.label}
            </p>
          ) : null}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg shrink-0 text-gray-400" aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
}
