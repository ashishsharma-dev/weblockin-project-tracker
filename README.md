# Partner Profit Manager

Partner Profit Manager is a production-ready internal ERP/CRM for a small software agency with four partners. It tracks project revenue, expenses, collections, partner profit shares, payouts, reporting, and exports from one Next.js dashboard.

## Stack

- Next.js 15 + App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- NextAuth credentials auth
- Zod validation
- React Hook Form
- Recharts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Generate Prisma client and migrate database:

```bash
npm run db:generate
npm run db:push
```

4. Seed sample data:

```bash
npm run db:seed
```

5. Start development server:

```bash
npm run dev
```

## Default logins

- Admin: `admin@ppm.local` / `password123`
- Partner A: `a@ppm.local` / `password123`
- Partner B: `b@ppm.local` / `password123`
- Partner C: `c@ppm.local` / `password123`
- Partner D: `d@ppm.local` / `password123`

## Production build

```bash
npm run build
npm start
```

## VPS deployment with PM2 and Nginx

1. Install Node.js 20+, Nginx, and PM2 on the VPS.
2. Clone the project and create `.env`.
3. Run:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run build
pm2 start npm --name partner-profit-manager -- start
pm2 save
```

4. Point Nginx to the Next.js process:

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

5. Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Notes

- Profit split calculations happen on the server in `lib/project-financials.ts` and `lib/profit-split.ts`.
- Project expenses and payments automatically recalculate project totals and partner earnings.
- Export endpoints are available at `/api/export/[type]?format=csv|excel|pdf`.
