import Link from "next/link";
import { Globe, FileText, Palette, Share2, Monitor, Briefcase } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Globe, FileText, Palette, Share2, Monitor, Briefcase,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: { templates: number };
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Browse by Category</h2>
        <p className="mt-2 text-gray-500">Find the perfect template for your next project</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon || "Globe"] || Globe;
          return (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.slug}`}
              className="card flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{cat.name}</h3>
              <p className="mt-1 text-xs text-gray-400">{cat._count.templates} templates</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
