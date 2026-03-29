import { prisma } from "@/lib/prisma";
import { TemplateCard } from "@/components/TemplateCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface BrowsePageProps {
  searchParams: { category?: string; format?: string; q?: string; sort?: string };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { category, format, q, sort } = searchParams;

  const where: any = { published: true };
  if (category) where.category = { slug: category };
  if (format) where.format = format;
  if (q) where.title = { contains: q };

  const orderBy: any = sort === "price-asc"
    ? { price: "asc" }
    : sort === "price-desc"
    ? { price: "desc" }
    : sort === "newest"
    ? { createdAt: "desc" }
    : { downloads: "desc" };

  const [templates, categories] = await Promise.all([
    prisma.template.findMany({
      where,
      include: { creator: { select: { name: true } }, category: { select: { name: true } } },
      orderBy,
    }),
    prisma.category.findMany({
      include: { _count: { select: { templates: true } } },
    }),
  ]);

  const formats = ["figma", "notion", "canva", "psd", "docx"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card p-5">
            {/* Search */}
            <form>
              <label className="text-sm font-semibold text-gray-700">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search templates..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </form>

            {/* Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
              <div className="mt-2 space-y-1">
                <Link
                  href="/browse"
                  className={`block rounded-lg px-3 py-1.5 text-sm ${!category ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.slug}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm ${category === cat.slug ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {cat.name} ({cat._count.templates})
                  </Link>
                ))}
              </div>
            </div>

            {/* Format filter */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700">Format</h3>
              <div className="mt-2 space-y-1">
                <Link
                  href="/browse"
                  className={`block rounded-lg px-3 py-1.5 text-sm ${!format ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  All Formats
                </Link>
                {formats.map((f) => (
                  <Link
                    key={f}
                    href={`/browse?format=${f}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm uppercase ${format === f ? "bg-brand-50 font-medium text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {f}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Template grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">{templates.length} templates found</p>
            <div className="flex gap-2">
              {[
                { label: "Popular", value: "" },
                { label: "Newest", value: "newest" },
                { label: "Price: Low", value: "price-asc" },
                { label: "Price: High", value: "price-desc" },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/browse?${new URLSearchParams({ ...(category ? { category } : {}), ...(format ? { format } : {}), ...(s.value ? { sort: s.value } : {}) }).toString()}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${(sort || "") === s.value ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">No templates found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  slug={t.slug}
                  description={t.description}
                  price={t.price}
                  salePrice={t.salePrice}
                  format={t.format}
                  downloads={t.downloads}
                  creator={t.creator.name || "Anonymous"}
                  category={t.category.name}
                  featured={t.featured}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
