import Link from 'next/link'
import { Bike, Clock, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bike className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BikeShare</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sewa Sepeda Mudah & Cepat
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistem peminjaman sepeda modern dengan antrian teratur, durasi fleksibel, dan pembayaran mudah. Mulai petualangan Anda sekarang!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-lg"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Fitur Unggulan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Durasi Fleksibel
            </h4>
            <p className="text-gray-600">
              Sewa sepeda dengan durasi 1 jam, bisa diperpanjang hingga 2 kali jika tidak ada antrian.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Antrian Teratur
            </h4>
            <p className="text-gray-600">
              Sistem antrian FIFO yang adil dengan notifikasi saat sepeda tersedia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Bike className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Berbagai Jenis Sepeda
            </h4>
            <p className="text-gray-600">
              Pilihan sepeda mountain, city, road, electric, dan kids dengan tarif variatif.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Sistem Aman
            </h4>
            <p className="text-gray-600">
              Pembayaran prepaid dengan tracking durasi real-time dan status sepeda.
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-100">Sepeda Tersedia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-blue-100">Pengguna Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">06:00-19:00</div>
              <div className="text-blue-100">Jam Operasional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 BikeShare. Sistem Peminjaman Sepeda Modern.
          </p>
        </div>
      </footer>
    </div>
  )
}