# TemplateVault - Digital Template Marketplace

A full-stack marketplace for buying and selling digital templates (Figma, Notion, Canva, etc.)

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **State**: Zustand

## Quick Start

```bash
cd marketplace
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Demo Accounts
- **Creator**: creator@demo.com / demo1234
- **Buyer**: buyer@demo.com / demo1234

## Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Update `.env` with your keys
4. Set up a webhook endpoint for `/api/webhooks/stripe`

## Deployment
Deploy to Vercel:
```bash
npm i -g vercel
vercel
```

For production, switch to PostgreSQL by updating the Prisma datasource provider and DATABASE_URL.

## Features
- Browse templates with search, filter by category/format/price
- Template detail pages with reviews
- Shopping cart with Stripe checkout
- Creator dashboard with earnings tracking
- User authentication (sign up as buyer or creator)
- Upload and manage templates
- Responsive design
