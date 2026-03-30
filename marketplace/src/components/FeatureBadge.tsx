"use client";

import { YES_NO_FEATURES } from "@/lib/types";

interface FeatureBadgeProps {
  featureKey: string;
  value: boolean;
  size?: "sm" | "md";
}

export function FeatureBadge({ featureKey, value, size = "md" }: FeatureBadgeProps) {
  const feature = YES_NO_FEATURES.find((f) => f.key === featureKey);
  if (!feature || !value) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>{feature.icon}</span>
      <span className="font-medium">{feature.label}</span>
    </span>
  );
}

export function FeatureList({ place }: { place: Record<string, any> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {YES_NO_FEATURES.map((f) =>
        place[f.key] ? <FeatureBadge key={f.key} featureKey={f.key} value={true} /> : null
      )}
    </div>
  );
}
