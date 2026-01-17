# ThriftUp - Circular Fashion Marketplace

A modern marketplace platform built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

### 🛍️ Marketplace & Auctions
- Browse vintage clothing listings
- Real-time auction bidding system
- Category filtering and search
- Seller profiles with ratings
- Transaction history

### 🎉 Thrift-Meet Events
- Discover local vintage meetups
- Event registration and management
- Location-based event discovery
- Community engagement

### 💬 Community Hub
- Discussion forums
- User profiles with reputation
- Like and reply to posts
- Direct messaging between users

### 👤 User Management
- Secure authentication with Supabase
- User profiles and preferences
- Seller reputation system
- Transaction history

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd thriftup
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Set up database
- Open Supabase SQL Editor
- Run all SQL from `scripts/setup-database.sql`

5. Run development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── auth/                # Auth pages (login, signup)
│   ├── marketplace/         # Marketplace page
│   ├── auctions/            # Auctions page
│   ├── events/              # Events page
│   ├── community/           # Community page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable components
├── lib/                     # Utility functions
├── scripts/                 # Database migrations
└── public/                  # Static assets
```

## API Routes

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing

### Auctions
- `GET /api/auctions` - Get active auctions
- `POST /api/auctions` - Create new auction

### Bids
- `POST /api/bids` - Place a bid

### Events
- `GET /api/events` - Get upcoming events
- `POST /api/events` - Create new event

## Database Schema

- **users** - User profiles and auth
- **listings** - Marketplace listings
- **auctions** - Active auctions
- **bids** - Auction bids
- **events** - Thrift-meet events
- **event_attendees** - Event registrations
- **community_posts** - Discussion posts
- **post_replies** - Comment replies
- **messages** - Direct messages
- **orders** - Transaction history

## Authentication

Built with Supabase Auth:
- Email/password authentication
- JWT tokens stored in secure cookies
- Row Level Security for data protection
- Session management

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy to Vercel:**
```bash
npm i -g vercel
vercel
```

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Contact support team

## Roadmap

- [ ] Payment integration (Stripe)
- [ ] User notifications
- [ ] Advanced search and filters
- [ ] Seller shop pages
- [ ] Review system
- [ ] Wishlist feature
- [ ] Mobile app
- [ ] Analytics dashboard
