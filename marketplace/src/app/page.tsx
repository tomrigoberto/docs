import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { TemplateCard } from "@/components/TemplateCard";
import { Testimonials } from "@/components/Testimonials";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredTemplates, categories] = await Promise.all([
    prisma.template.findMany({
      where: { featured: true, published: true },
      include: { creator: { select: { name: true } }, category: { select: { name: true } } },
      take: 4,
      orderBy: { downloads: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { templates: true } } },
    }),
  ]);

  return (
    <>
      <Hero />

      <CategoryGrid categories={categories} />

      {/* Featured templates */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Templates</h2>
            <p className="mt-1 text-gray-500">Hand-picked premium templates</p>
          </div>
          <Link href="/browse" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTemplates.map((t) => (
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
      </section>

      <Testimonials />

      {/* CTA */}
      <section className="bg-brand-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Start Selling Your Templates</h2>
          <p className="mt-3 text-brand-200">
            Join 200+ creators earning passive income by selling their digital templates on TemplateVault.
          </p>
          <Link href="/auth/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Become a Creator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
