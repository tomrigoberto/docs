"use client";

interface PawRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  label?: string;
}

const sizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function PawRating({ rating, max = 5, size = "md", interactive = false, onChange, label }: PawRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="mr-2 text-sm text-gray-600">{label}</span>}
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${sizes[size]} transition-transform ${
              interactive ? "cursor-pointer hover:scale-125" : "cursor-default"
            } ${i < Math.round(rating) ? "opacity-100" : "opacity-25"}`}
          >
            🐾
          </button>
        ))}
      </div>
      {!interactive && rating > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
