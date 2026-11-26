import Link from 'next/link'
import { Bike, Clock, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="BikeShare Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-[#1E3A8A] hover:text-[#1E40AF] font-medium transition-all hover:scale-105"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:from-[#1E40AF] hover:to-[#3B82F6] font-medium transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-[#1E3A8A]">Sistem Modern & Terpercaya</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Sewa Sepeda <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]">Mudah & Cepat</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Sistem peminjaman sepeda modern dengan antrian teratur, durasi fleksibel, dan pembayaran mudah. Mulai petualangan Anda sekarang!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                Mulai Sekarang
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl hover:bg-[#1E3A8A] hover:text-white font-semibold text-lg transition-all hover:scale-105"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Nikmati pengalaman peminjaman sepeda yang modern dan nyaman
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative bg-white p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Durasi Fleksibel
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sewa sepeda dengan durasi 1 jam, bisa diperpanjang hingga 2 kali jika tidak ada antrian.
              </p>
            </div>
          </div>

          <div className="group relative bg-white p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Antrian Teratur
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sistem antrian FIFO yang adil dengan notifikasi saat sepeda tersedia.
              </p>
            </div>
          </div>

          <div className="group relative bg-white p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Bike className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Berbagai Jenis Sepeda
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Pilihan sepeda mountain, city, road, electric, dan kids dengan tarif variatif.
              </p>
            </div>
          </div>

          <div className="group relative bg-white p-8 rounded-2xl shadow-md border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Sistem Aman
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Pembayaran prepaid dengan tracking durasi real-time dan status sepeda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#2563EB]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI4aDIyVjM0SDM2em0tNiAwSDhWNkgzdjI4aDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="font-display text-6xl lg:text-7xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">50+</div>
              <div className="text-lg text-blue-100 font-medium">Sepeda Tersedia</div>
            </div>
            <div className="group">
              <div className="font-display text-6xl lg:text-7xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">100+</div>
              <div className="text-lg text-blue-100 font-medium">Pengguna Aktif</div>
            </div>
            <div className="group">
              <div className="font-display text-6xl lg:text-7xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">06:00-19:00</div>
              <div className="text-lg text-blue-100 font-medium">Jam Operasional</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 lg:p-16 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Siap Memulai Petualangan?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Daftar sekarang dan nikmati kemudahan peminjaman sepeda dengan sistem modern kami.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#1E3A8A] rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Daftar Sekarang
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <img
              src="/logo.png"
              alt="BikeShare Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="flex gap-8 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Daftar</Link>
            </div>
            <div className="h-px w-24 bg-slate-700"></div>
            <p className="text-sm text-slate-500">
              © 2024 BikeShare. Sistem Peminjaman Sepeda Modern.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}