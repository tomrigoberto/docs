"use client";

import Link from "next/link";
import { Download, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  format: string;
  downloads: number;
  creator: string;
  category: string;
  featured?: boolean;
}

const FORMAT_COLORS: Record<string, string> = {
  figma: "bg-purple-100 text-purple-700",
  notion: "bg-gray-100 text-gray-700",
  canva: "bg-cyan-100 text-cyan-700",
  psd: "bg-blue-100 text-blue-700",
  docx: "bg-green-100 text-green-700",
};

export function TemplateCard({
  id, title, slug, description, price, salePrice, format, downloads, creator, category, featured,
}: TemplateCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const effectivePrice = salePrice ?? price;

  return (
    <div className="card group flex flex-col overflow-hidden">
      {/* Preview area */}
      <Link href={`/templates/${id}`} className="relative block">
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
          <span className="text-4xl font-bold text-brand-200">{title.charAt(0)}</span>
        </div>
        {featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            <Star className="h-3 w-3" /> Featured
          </span>
        )}
        {salePrice && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
            SALE
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FORMAT_COLORS[format] || "bg-gray-100 text-gray-700"}`}>
            {format.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">{category}</span>
        </div>

        <Link href={`/templates/${id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="mt-1 flex-1 text-sm text-gray-500 line-clamp-2">{description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(effectivePrice)}</span>
            {salePrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Download className="h-3.5 w-3.5" />
            {downloads.toLocaleString()}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">by {creator}</span>
          <button
            onClick={() => addItem({ id, title, price, salePrice, format, creator })}
            className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
