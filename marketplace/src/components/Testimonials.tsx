const testimonials = [
  {
    name: "Sarah Chen",
    role: "Startup Founder",
    content: "TemplateVault saved me weeks of design work. The SaaS landing page kit was exactly what I needed to launch my product.",
  },
  {
    name: "Marcus Johnson",
    role: "Content Creator",
    content: "I've been selling my Notion templates here and made over $5K in my first month. The platform makes it incredibly easy.",
  },
  {
    name: "Emma Rodriguez",
    role: "Freelance Designer",
    content: "The quality of templates here is outstanding. I use them as starting points for client projects and save hours every week.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Loved by Creators & Buyers</h2>
          <p className="mt-2 text-gray-500">See what our community is saying</p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-600">&ldquo;{t.content}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
