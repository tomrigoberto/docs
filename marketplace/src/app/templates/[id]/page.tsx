import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/stripe";
import { AddToCartButton } from "./AddToCartButton";
import { Download, Star, Clock, FileType, User } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await prisma.template.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { name: true, bio: true } },
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!template) notFound();

  const avgRating =
    template.reviews.length > 0
      ? template.reviews.reduce((sum, r) => sum + r.rating, 0) / template.reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        {" / "}
        <Link href="/browse" className="hover:text-gray-600">Browse</Link>
        {" / "}
        <Link href={`/browse?category=${template.category.slug}`} className="hover:text-gray-600">
          {template.category.name}
        </Link>
        {" / "}
        <span className="text-gray-600">{template.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex h-80 items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 sm:h-[400px]">
              <span className="text-8xl font-bold text-brand-300">{template.title.charAt(0)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="card mt-6 p-6">
            <h2 className="text-lg font-bold text-gray-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-gray-600">
              {template.longDesc || template.description}
            </p>
          </div>

          {/* Reviews */}
          <div className="card mt-6 p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Reviews ({template.reviews.length})
            </h2>
            {template.reviews.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {template.reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{r.user.name}</span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Purchase */}
        <div>
          <div className="card sticky top-24 p-6">
            <h1 className="text-xl font-bold text-gray-900">{template.title}</h1>

            <div className="mt-3 flex items-center gap-2">
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                </div>
              )}
              <span className="text-sm text-gray-400">
                {template.reviews.length} reviews
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(template.salePrice ?? template.price)}
              </span>
              {template.salePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(template.price)}
                </span>
              )}
            </div>

            <AddToCartButton
              template={{
                id: template.id,
                title: template.title,
                price: template.price,
                salePrice: template.salePrice,
                format: template.format,
                creator: template.creator.name || "Anonymous",
              }}
            />

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <FileType className="h-4 w-4 text-gray-400" />
                Format: <span className="font-medium text-gray-700 uppercase">{template.format}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Download className="h-4 w-4 text-gray-400" />
                {template.downloads.toLocaleString()} downloads
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Clock className="h-4 w-4 text-gray-400" />
                Updated {template.updatedAt.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <User className="h-4 w-4 text-gray-400" />
                By {template.creator.name}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <h3 className="text-sm font-semibold text-green-800">What&apos;s included:</h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>- Full source files</li>
                <li>- Commercial license</li>
                <li>- Lifetime updates</li>
                <li>- Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
