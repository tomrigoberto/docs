import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "website-templates" },
      update: {},
      create: { name: "Website Templates", slug: "website-templates", icon: "Globe" },
    }),
    prisma.category.upsert({
      where: { slug: "notion-templates" },
      update: {},
      create: { name: "Notion Templates", slug: "notion-templates", icon: "FileText" },
    }),
    prisma.category.upsert({
      where: { slug: "design-kits" },
      update: {},
      create: { name: "Design Kits", slug: "design-kits", icon: "Palette" },
    }),
    prisma.category.upsert({
      where: { slug: "social-media" },
      update: {},
      create: { name: "Social Media", slug: "social-media", icon: "Share2" },
    }),
    prisma.category.upsert({
      where: { slug: "presentations" },
      update: {},
      create: { name: "Presentations", slug: "presentations", icon: "Monitor" },
    }),
    prisma.category.upsert({
      where: { slug: "business" },
      update: {},
      create: { name: "Business", slug: "business", icon: "Briefcase" },
    }),
  ]);

  // Create demo creator
  const creator = await prisma.user.upsert({
    where: { email: "creator@demo.com" },
    update: {},
    create: {
      name: "Alex Designer",
      email: "creator@demo.com",
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: "creator",
      bio: "Professional designer with 10+ years of experience creating beautiful templates.",
    },
  });

  // Create demo buyer
  await prisma.user.upsert({
    where: { email: "buyer@demo.com" },
    update: {},
    create: {
      name: "Demo Buyer",
      email: "buyer@demo.com",
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: "buyer",
    },
  });

  // Create templates
  const templates = [
    {
      title: "SaaS Landing Page Kit",
      slug: "saas-landing-page-kit",
      description: "A complete landing page template for SaaS products with 12 sections, dark/light modes, and responsive design.",
      longDesc: "Launch your SaaS product with a stunning landing page. Includes hero section, features grid, pricing tables, testimonials, FAQ, CTA sections, and more. Fully responsive and customizable.",
      price: 49,
      salePrice: 39,
      format: "figma",
      featured: true,
      categoryId: categories[0].id,
      creatorId: creator.id,
      downloads: 1243,
    },
    {
      title: "Startup Notion Workspace",
      slug: "startup-notion-workspace",
      description: "All-in-one Notion workspace for startups. Track OKRs, manage projects, run sprints, and document everything.",
      longDesc: "The ultimate Notion workspace designed for startup teams. Includes project tracker, OKR dashboard, sprint board, meeting notes, wiki, CRM, and investor relations templates.",
      price: 29,
      format: "notion",
      featured: true,
      categoryId: categories[1].id,
      creatorId: creator.id,
      downloads: 2891,
    },
    {
      title: "Brand Identity Kit Pro",
      slug: "brand-identity-kit-pro",
      description: "Complete brand identity kit with logo templates, color palettes, typography guides, and brand guidelines.",
      longDesc: "Everything you need to build a professional brand identity. Includes 50+ logo templates, color palette generator, typography pairings, brand guideline document, and social media assets.",
      price: 79,
      salePrice: 59,
      format: "figma",
      featured: true,
      categoryId: categories[2].id,
      creatorId: creator.id,
      downloads: 876,
    },
    {
      title: "Instagram Content Bundle",
      slug: "instagram-content-bundle",
      description: "200+ Instagram post and story templates. Aesthetic designs for creators, coaches, and small businesses.",
      longDesc: "Grow your Instagram presence with 200+ professionally designed templates. Includes carousel posts, single posts, stories, highlights covers, and reels covers. Easily customizable in Canva.",
      price: 35,
      format: "canva",
      featured: true,
      categoryId: categories[3].id,
      creatorId: creator.id,
      downloads: 3412,
    },
    {
      title: "Pitch Deck Masterclass",
      slug: "pitch-deck-masterclass",
      description: "Investor-ready pitch deck template with 30+ slides. Used by YC-backed startups to raise millions.",
      longDesc: "Create a compelling pitch deck that investors love. Includes problem/solution, market size, business model, traction, team, and financial slides. Clean, modern design with data visualization.",
      price: 45,
      format: "figma",
      featured: false,
      categoryId: categories[4].id,
      creatorId: creator.id,
      downloads: 1567,
    },
    {
      title: "Business Plan Template",
      slug: "business-plan-template",
      description: "Professional business plan template with financial projections, market analysis, and executive summary sections.",
      longDesc: "Write a comprehensive business plan with this structured template. Includes executive summary, company description, market analysis, organization structure, product line, marketing strategy, and financial projections.",
      price: 25,
      format: "docx",
      featured: false,
      categoryId: categories[5].id,
      creatorId: creator.id,
      downloads: 2134,
    },
    {
      title: "E-commerce UI Kit",
      slug: "ecommerce-ui-kit",
      description: "Complete e-commerce UI kit with 80+ components, 20+ page layouts, and a full design system.",
      longDesc: "Build beautiful online stores with this comprehensive UI kit. Includes product cards, checkout flows, user dashboards, admin panels, and a complete design system with tokens and components.",
      price: 89,
      salePrice: 69,
      format: "figma",
      featured: true,
      categoryId: categories[0].id,
      creatorId: creator.id,
      downloads: 945,
    },
    {
      title: "Content Creator Notion Hub",
      slug: "content-creator-notion-hub",
      description: "Notion workspace for content creators. Plan, create, schedule, and track all your content in one place.",
      longDesc: "The ultimate content management system in Notion. Includes content calendar, idea bank, script templates, analytics tracker, brand deals CRM, and revenue dashboard.",
      price: 19,
      format: "notion",
      featured: false,
      categoryId: categories[1].id,
      creatorId: creator.id,
      downloads: 4521,
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
