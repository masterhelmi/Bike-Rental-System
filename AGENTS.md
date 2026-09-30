# BikeShare - Agent Documentation

## Project Overview
Sistem peminjaman sepeda dengan Supabase dan Next.js. Mendukung 50+ sepeda, 100+ pengunjung, sistem antrian, dan pembayaran prepaid.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: React hooks, Supabase Realtime

## Key Commands

### Development
```bash
npm run dev              # Start development server on localhost:3000
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Setup
Run these SQL files in Supabase SQL Editor in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_functions_triggers.sql`
3. `supabase/migrations/003_seed_data.sql`
4. `supabase/migrations/004_rls_policies.sql`
5. `supabase/migrations/005_additional_functions.sql`

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_NAME` - App name
- `NEXT_PUBLIC_APP_URL` - App URL

## Database Schema

### Tables
- `profiles` - User profiles (extended from auth.users)
- `bike_types` - Bike types with hourly rates
- `bikes` - Bike inventory with status
- `rentals` - Rental transactions
- `queue` - Queue system
- `payments` - Payment records
- `operational_hours` - Operating hours

### Key Functions
- `extend_rental_duration()` - Extend rental with lock
- `join_queue_with_lock()` - Join queue with optimistic locking
- `process_queue_assignment()` - Auto-assign bikes from queue
- `check_overdue_rentals()` - Mark overdue rentals
- `check_queue_timeout()` - Handle queue timeouts
- `get_user_active_rental()` - Get user's active rental
- `get_user_queue_position()` - Get user's queue position
- `get_available_bikes_count()` - Count available bikes by type
- `get_daily_statistics()` - Get daily stats

## Business Rules

### Duration & Extensions
- Initial duration: 1 hour (60 minutes)
- Extension: 30 minutes per extension
- Max extensions: 2 times
- Cannot extend if queue exists for the bike

### Queue System
- Default: FIFO (First In First Out)
- User can prefer specific bike or bike type
- Notification when bike available
- 15-minute timeout for response
- Auto-skip if no response

### Payment
- System: Prepaid (pay upfront)
- Rates: Variable by bike type
- Status: pending, paid, partial, refunded

### Operating Hours
- Open: 06:00 - 19:00 daily
- Block bookings outside hours

## API Routes Structure

### Rentals
- `GET /api/rentals` - List rentals (filter: user_id, status, limit)
- `POST /api/rentals` - Create rental
- `GET /api/rentals/[id]` - Get single rental
- `PUT /api/rentals/[id]` - Update rental (complete, cancel)
- `POST /api/rentals/extend` - Extend rental (30 minutes)

### Queue
- `GET /api/queue` - List queue (filter: user_id, status, bike_id)
- `POST /api/queue` - Join queue (with direct assignment if bike available)
- `GET /api/queue/[id]` - Get queue item
- `PUT /api/queue/[id]` - Update queue (accept assignment, cancel)
- `POST /api/queue/process` - Process queue assignments

### Bikes
- `GET /api/bikes` - List bikes (filter: status, bike_type_id, available)
- `POST /api/bikes` - Add bike
- `GET /api/bikes/[id]` - Get bike
- `PUT /api/bikes/[id]` - Update bike
- `DELETE /api/bikes/[id]` - Delete bike (if not rented)

### Bike Types
- `GET /api/bike-types` - List bike types
- `POST /api/bike-types` - Add bike type
- `GET /api/bike-types/[id]` - Get bike type
- `PUT /api/bike-types/[id]` - Update bike type
- `DELETE /api/bike-types/[id]` - Delete bike type (if not in use)

### Payments
- `GET /api/payments` - List payments (filter: user_id, rental_id, status)
- `POST /api/payments` - Create payment

## Components

### User Dashboard
- `RentalCard` - Display active rental with timer and actions
- `QueueStatus` - Show queue position and estimated wait
- `Timer` - Countdown timer component

### Admin Dashboard
- `StatsCards` - Overview statistics (bikes, rentals, queue, revenue)
- `BikeTable` - CRUD interface for bike management

## Security Considerations

### Row Level Security (RLS)
- Users can only access their own data
- Admins can access all data
- Public can read bikes and bike types
- Service role key only used server-side

### Optimistic Locking
- All transactional tables have `lock_version`
- Updates only succeed if version matches
- Prevents race conditions in queue and rentals

### Auth
- Required for all features
- Admin role for admin dashboard
- Profile auto-created on signup

## Common Issues & Solutions

### Supabase Connection
- Error: Check environment variables
- RLS issues: Verify policies in Supabase dashboard
- Auth issues: Ensure user exists in auth.users

### Queue Race Conditions
- Using optimistic locking with `lock_version`
- PostgreSQL advisory locks for critical operations
- Row-level locking with `FOR UPDATE`

### Real-time Updates
- Enable Realtime on rentals and queue tables in Supabase
- Use Supabase Realtime for live updates
- Fallback to polling if needed

## Future Enhancements

### Planned Features
- Payment gateway integration (Midtrans/Xendit)
- Email notifications for queue and rental status
- Mobile app (React Native)
- QR code scanning for bike checkout
- Advanced analytics and reporting
- Maintenance scheduling system
- User ratings and reviews

### Scalability
- Current setup supports 50 bikes, 100 users
- Can scale to 500+ bikes, 1000+ users
- Database indexing for performance
- Supabase Pro tier for higher limits