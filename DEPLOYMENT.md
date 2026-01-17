# ThriftUp Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account
- Supabase project

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at https://supabase.com
2. Run the database setup script in the SQL Editor:
   - Copy contents of `scripts/setup-database.sql`
   - Execute in Supabase SQL Editor
3. Get your credentials:
   - Project URL (Settings > API)
   - Anon Key (Settings > API)

### 2. Environment Variables

Create or update `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

For production (Vercel):
1. Go to your Vercel project settings
2. Add the same environment variables (without `NEXT_PUBLIC_DEV_` for production)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deployment to Vercel

### Option 1: Git Integration (Recommended)

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase project configured
- [ ] Row Level Security (RLS) policies enabled
- [ ] Database backups configured
- [ ] Email verification configured (if using Supabase Auth)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] CORS configured if needed
- [ ] Rate limiting configured (optional)

## Security Best Practices

1. Never commit `.env.local`
2. Use Row Level Security on all tables
3. Keep Supabase credentials separate from code
4. Enable email verification for sign-ups
5. Use HTTPS only in production
6. Regularly update dependencies

## Database Migrations

For schema changes:

1. Create new migration file in `scripts/`
2. Execute in Supabase SQL Editor
3. Test thoroughly in development
4. Deploy changes

## Scaling Considerations

- Supabase auto-scales with your usage
- Vercel handles auto-scaling
- Monitor database connections
- Set up monitoring in Vercel dashboard
- Consider caching for frequently accessed data

## Support

For issues:
- Vercel: https://vercel.com/help
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
