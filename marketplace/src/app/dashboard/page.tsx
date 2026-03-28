"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DollarSign, Package, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { formatPrice } from "@/lib/stripe";

interface DashboardData {
  templates: any[];
  purchases: any[];
  totalEarnings: number;
  totalSales: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated") {
      fetch("/api/creators")
        .then((r) => r.json())
        .then(setData);
    }
  }, [status, router]);

  if (status === "loading" || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {session?.user?.name}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(data.totalEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalSales}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{data.templates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload form */}
      {showForm && <UploadForm onClose={() => setShowForm(false)} onCreated={() => {
        fetch("/api/creators").then((r) => r.json()).then(setData);
        setShowForm(false);
      }} />}

      {/* Templates list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">Your Templates</h2>
        {data.templates.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-gray-500">You haven&apos;t uploaded any templates yet.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Template</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Sales</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.templates.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                    <td className="px-4 py-3 text-gray-500">{t.category.name}</td>
                    <td className="px-4 py-3 text-gray-900">{formatPrice(t.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{t._count.purchases}</td>
                    <td className="px-4 py-3 text-gray-500">{t.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent sales */}
      {data.purchases.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Recent Sales</h2>
          <div className="mt-4 space-y-3">
            {data.purchases.map((p: any) => (
              <div key={p.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{p.template.title}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-semibold text-green-600">+{formatPrice(p.amount * 0.8)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(() => {
        // Fetch categories from a separate call or extract unique ones
        fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        longDesc: form.get("longDesc"),
        price: form.get("price"),
        format: form.get("format"),
        categoryId: form.get("categoryId"),
      }),
    });

    if (res.ok) {
      onCreated();
    } else {
      alert("Failed to create template");
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Upload New Template</h3>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input name="title" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Short Description</label>
          <input name="description" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Full Description</label>
          <textarea name="longDesc" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
          <input name="price" type="number" step="0.01" min="1" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <select name="format" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="figma">Figma</option>
            <option value="notion">Notion</option>
            <option value="canva">Canva</option>
            <option value="psd">PSD</option>
            <option value="docx">DOCX</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="categoryId" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating..." : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
