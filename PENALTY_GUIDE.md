# Panduan Penggunaan Sistem Denda Keterlambatan

## Overview
Sistem denda menggunakan pendekatan Grace Period + Denda Bertingkat untuk memberikan fleksibilitas kepada user tetapi tetap menegakkan disiplin.

## Aturan Denda

| Keterlambatan | Denda | Tier |
|---------------|-------|------|
| 0-5 menit | Rp 0 | Grace Period (Gratis) |
| 5-10 menit | Rp 10.000 | Ringan |
| 10-30 menit | Rp 20.000 | Sedang |
| 30-60 menit | Rp 50.000 | Berat |
| > 60 menit | Rp 100.000 | Parah (Maksimal) |

## Flow Pengembalian Sepeda

### Untuk User:

1. **Peminjaman Aktif**
   - Dashboard menampilkan timer countdown dengan sisa waktu
   - 10 menit sebelum habis: Notifikasi browser akan muncul
   - Sisa waktu ditampilkan besar dengan warna merah

2. **Saat Terlambat**
   - Banner oranye muncul dengan denda saat ini
   - Timer menampilkan "Waktu habis"
   - Tombol "Kembalikan Sepeda" berubah menjadi merah
   - Denda diperbarui secara real-time setiap menit

3. **Mengembalikan Sepeda**
   - Klik tombol "Kembalikan Sepeda"
   - Sistem otomatis menghitung denda berdasarkan keterlambatan
   - Status rental berubah menjadi:
     - `completed` jika tidak ada denda
     - `completed_with_penalty` jika ada denda
   - Record denda dibuat di tabel `penalties`
   - Sepeda status berubah kembali ke `available`

4. **Melihat Riwayat**
   - Buka menu "Riwayat" di dashboard
   - Peminjaman dengan denda ditandai dengan status "Selesai dengan Denda"
   - Detail denda dan menit keterlambatan ditampilkan

### Untuk Admin:

1. **Melihat Statistik Denda**
   - Dashboard admin menampilkan "Denda Hari Ini"
   - Analytics menampilkan "Total Denda" dari semua waktu

2. **Manajemen Denda**
   - Buka menu "Manajemen Denda" dari dashboard admin
   - Lihat semua denda dengan filter: Semua, Menunggu, Lunas, Dimaafkan
   - Statistik: Total menunggu pembayaran, total lunas, total dimaafkan

3. **Memaafkan Denda (Waiving)**
   - Admin dapat memaafkan denda dalam kasus khusus:
     - Darurat medis (bukti medis)
     - Masalah teknis sepeda (rusak, ban bocor)
     - Cuaca ekstrem (hujan deras, bencana)
     - Kesalahan sistem
   - Klik tombol "Maafkan" pada denda pending
   - Masukkan alasan pemaafan
   - Denda status berubah menjadi "waived"
   - Rental status berubah dari `completed_with_penalty` menjadi `completed`

4. **Menandai Denda Lunas**
   - Jika user membayar denda secara offline/tunai
   - Admin dapat menandai denda sebagai lunas
   - Klik tombol "Bayar" pada denda pending
   - Status berubah menjadi "paid"
   - Record payment dibuat otomatis

## API Endpoints

### Pengembalian Sepeda
- `POST /api/rentals/[id]/return` - Mengembalikan sepeda dengan perhitungan denda otomatis

### Penalties
- `GET /api/penalties` - Mendapatkan daftar denda
  - Query params: `user_id`, `status`
- `POST /api/penalties/[id]/waive` - Memaafkan denda
  - Body: `{ reason: string }`
- `POST /api/penalties/[id]/pay` - Menandai denda lunas
  - Body: `{ payment_method: string, transaction_id?: string }`

## Database Schema

### Field baru di tabel `rentals`:
- `actual_return_time` - Waktu sebenarnya saat sepeda dikembalikan
- `penalty_amount` - Jumlah denda (default 0)
- `overdue_minutes` - Total menit keterlambatan

### Tabel `penalties`:
- `id` - UUID primary key
- `rental_id` - Reference ke rentals
- `user_id` - Reference ke profiles
- `amount` - Jumlah denda
- `overdue_minutes` - Menit keterlambatan
- `penalty_tier` - 'none', 'light', 'medium', 'heavy', 'severe'
- `status` - 'pending', 'paid', 'waived'
- `created_at` - Timestamp pembuatan
- `paid_at` - Timestamp pembayaran
- `waived_by` - Admin yang memaafkan
- `waived_reason` - Alasan pemaafan

## SQL Functions

### calculate_late_penalty()
Menghitung denda berdasarkan keterlambatan:
```sql
SELECT calculate_late_penalty(end_time, actual_return_time);
```

### get_penalty_tier()
Menentukan tier denda:
```sql
SELECT get_penalty_tier(overdue_minutes);
```

## Tips untuk Admin

1. **Monitoring Rutin**
   - Cek halaman "Manajemen Denda" setiap hari
   - Perhatikan user yang sering terlambat
   - Hubungi user untuk edukasi jika perlu

2. **Kebijakan Waiving**
   - Hanya waiving jika ada alasan yang valid
   - Selalu catat alasan yang jelas
   - Pertimbangkan untuk memberikan warning ke user yang sering dimaafkan

3. **Reporting**
   - Gunakan analytics untuk melihat tren denda
   - Identifikasi jam/slot dengan banyak keterlambatan
   - Sesuaikan kebijakan jika diperlukan

## Troubleshooting

### Denda tidak muncul
- Pastikan migration `019_late_penalty_system.sql` sudah dijalankan
- Cek apakah API return dipanggil dengan benar
- Verifikasi field `actual_return_time` terisi

### Denda salah hitung
- Cek timezone database dan aplikasi
- Pastikan fungsi SQL `calculate_late_penalty` berjalan
- Verify field `end_time` dan `actual_return_time` benar

### Status rental tidak berubah
- Pastikan user_id valid di request
- Cek RLS policies untuk tabel rentals dan penalties
- Verify admin client menggunakan service role key
