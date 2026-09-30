# BikeShare - Sistem Peminjaman Sepeda

Sistem peminjaman sepeda modern dengan Supabase dan Next.js. Mendukung 50+ sepeda, 100+ pengunjung, durasi 1 jam (dengan perpanjangan), sistem antrian FIFO+pilihan, pembayaran prepaid, dan jam operasional 06:00-19:00.

## Fitur Utama

### Untuk User
- **Dashboard User**: Melihat status peminjaman aktif dengan countdown timer
- **Sistem Antrian**: FIFO dengan opsi memilih sepeda/jenis sepeda tertentu
- **Durasi Fleksibel**: 1 jam per pinjaman, bisa perpanjangan hingga 2x (30 menit per perpanjangan)
- **Pembayaran Prepaid**: Bayar di muka dengan berbagai metode
- **Riwayat Peminjaman**: Lihat semua transaksi sebelumnya

### Untuk Admin
- **Dashboard Admin**: Overview dengan statistik real-time
- **CRUD Sepeda**: Tambah, edit, hapus sepeda
- **Manajemen Antrian**: Lihat dan atur antrian user
- **Daftar Transaksi**: Lihat semua transaksi dan pendapatan
- **Analytics**: Grafik peminjaman dan pendapatan

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Akun Supabase (gratis)

## Setup Instructions

### 1. Clone the repository

```bash
cd bike-rental-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor di Supabase dashboard
3. Jalankan migration files secara berurutan:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions_triggers.sql`
   - `supabase/migrations/003_seed_data.sql`
   - `supabase/migrations/004_rls_policies.sql`
   - `supabase/migrations/005_additional_functions.sql`

### 4. Environment Variables

Copy `.env.example` ke `.env.local` dan isi dengan credentials Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_NAME=Bike Rental System
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Database Schema

### Tabel Utama

- **profiles**: Data user (extended dari auth.users)
- **bike_types**: Jenis sepeda dengan tarif per jam
- **bikes**: Data sepeda dengan status dan lokasi
- **rentals**: Transaksi peminjaman dengan durasi dan status
- **queue**: Sistem antrian dengan posisi dan timeout
- **payments**: Riwayat pembayaran
- **operational_hours**: Jam operasional

### Key Features

- **Optimistic Locking**: Mencegah race condition dengan `lock_version`
- **PostgreSQL Functions**: Auto-calculate duration, update bike status, process queue
- **Row Level Security**: Data user terproteksi, admin akses penuh
- **Real-time Support**: Supabase Realtime untuk update status

## API Routes

### Rentals
- `GET /api/rentals` - List rentals (filter by user_id, status)
- `POST /api/rentals` - Create new rental
- `GET /api/rentals/[id]` - Get single rental
- `PUT /api/rentals/[id]` - Update rental (complete, cancel)
- `POST /api/rentals/extend` - Extend rental duration

### Queue
- `GET /api/queue` - List queue items
- `POST /api/queue` - Join queue
- `GET /api/queue/[id]` - Get queue item
- `PUT /api/queue/[id]` - Update queue (accept, cancel)
- `POST /api/queue/process` - Process queue assignments

### Bikes
- `GET /api/bikes` - List bikes (filter by status, type)
- `POST /api/bikes` - Add new bike
- `GET /api/bikes/[id]` - Get single bike
- `PUT /api/bikes/[id]` - Update bike
- `DELETE /api/bikes/[id]` - Delete bike

### Bike Types
- `GET /api/bike-types` - List bike types
- `POST /api/bike-types` - Add bike type
- `GET /api/bike-types/[id]` - Get bike type
- `PUT /api/bike-types/[id]` - Update bike type
- `DELETE /api/bike-types/[id]` - Delete bike type

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment

## Business Rules

### Durasi Peminjaman
- Durasi awal: 1 jam (60 menit)
- Perpanjangan: 30 menit per perpanjangan
- Maksimal perpanjangan: 2 kali
- Tidak bisa perpanjangan jika ada antrian untuk sepeda tersebut

### Sistem Antrian
- Default: FIFO (First In First Out)
- User bisa prefer sepeda spesifik atau jenis sepeda
- Notifikasi saat sepeda tersedia
- Timeout 15 menit untuk respon setelah notifikasi
- Auto-skip jika user tidak respon

### Pembayaran
- Sistem: Prepaid (bayar di muka)
- Tarif: Variatif berdasarkan jenis sepeda
- Status: pending, paid, partial, refunded

### Jam Operasional
- Buka: 06:00 - 19:00 setiap hari
- Block booking di luar jam operasional

## Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Setup environment variables di Vercel dashboard
4. Deploy

### Environment Variables untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_NAME=Bike Rental System
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Project Structure

```
bike-rental-system/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth pages (login, register)
│   ├── dashboard/        # User dashboard
│   └── admin/            # Admin dashboard
├── components/
│   ├── dashboard/        # User dashboard components
│   └── admin/            # Admin dashboard components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── types/            # TypeScript types
│   └── utils.ts          # Utility functions
└── supabase/
    └── migrations/       # Database migrations
```

## Troubleshooting

### Supabase Connection Issues
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
- Cek RLS policies di Supabase dashboard
- Pastikan user sudah dibuat di auth.users

### Build Errors
- Jalankan `npm run lint` untuk cek error
- Pastikan semua dependencies terinstall
- Cek TypeScript errors dengan `npm run type-check`

## License

MIT License - feel free to use this project for learning or production.

## Support

Untuk support atau pertanyaan, buka issue di repository atau hubungi development team.