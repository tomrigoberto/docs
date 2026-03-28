import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
              <Sparkles className="h-5 w-5" />
              TemplateVault
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              The premium marketplace for digital templates and creative assets.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Marketplace</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/browse" className="text-sm text-gray-500 hover:text-gray-700">Browse All</Link></li>
              <li><Link href="/browse?category=website-templates" className="text-sm text-gray-500 hover:text-gray-700">Website Templates</Link></li>
              <li><Link href="/browse?category=notion-templates" className="text-sm text-gray-500 hover:text-gray-700">Notion Templates</Link></li>
              <li><Link href="/browse?category=design-kits" className="text-sm text-gray-500 hover:text-gray-700">Design Kits</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Creators</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/auth/signup" className="text-sm text-gray-500 hover:text-gray-700">Start Selling</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Creator Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} TemplateVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
