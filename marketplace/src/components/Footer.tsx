import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-orange-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-brand-600">RRRuff</span>
            <span className="text-sm text-gray-500">- Yelp for Dogs</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/places" className="hover:text-brand-600">Explore</Link>
            <Link href="/auth/signup" className="hover:text-brand-600">Join</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} RRRuff. Every dog deserves a review.
          </p>
        </div>
      </div>
    </footer>
  );
}
