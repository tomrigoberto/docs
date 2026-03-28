import Link from "next/link";
import { ArrowRight, Zap, Shield, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0MjYzZWIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Zap className="h-4 w-4" />
            Over 10,000+ templates sold
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Premium Templates for{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Modern Creators
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Discover beautifully crafted templates for websites, Notion, Figma, Canva, and more.
            Save hundreds of hours and launch faster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/browse" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
              Browse Templates <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/signup" className="btn-secondary px-8 py-3 text-base">
              Start Selling
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="mt-1 text-sm text-gray-500">Templates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">12K+</div>
            <div className="mt-1 text-sm text-gray-500">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">200+</div>
            <div className="mt-1 text-sm text-gray-500">Creators</div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mx-auto mt-16 flex max-w-xl flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-5 w-5 text-green-500" />
            Secure Payments
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Zap className="h-5 w-5 text-amber-500" />
            Instant Download
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-5 w-5 text-brand-500" />
            Creator-Friendly
          </div>
        </div>
      </div>
    </section>
  );
}
