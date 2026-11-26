'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Bike as BikeIcon, DollarSign, Calendar, Clock, AlertTriangle } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalRevenue: 0,
    totalPenalties: 0,
    monthlyRevenue: 0,
    activeRentals: 0,
    averageDuration: 0,
    popularBikeType: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch rentals
      const rentalsResponse = await fetch('/api/rentals')
      const rentalsData = await rentalsResponse.json()
      const rentals = rentalsData.data || []

      // Fetch payments
      const paymentsResponse = await fetch('/api/payments')
      const paymentsData = await paymentsResponse.json()
      const payments = paymentsData.data || []

      // Fetch penalties
      const penaltiesResponse = await fetch('/api/penalties')
      const penaltiesData = await penaltiesResponse.json()
      const penalties = penaltiesData.data || []

      console.log('Payments data:', payments)
      console.log('Rentals data:', rentals)

      // Calculate stats
      const totalRentals = rentals.length
      const totalRevenue = payments
        .filter((p: any) => p.payment_status === 'completed')
        .reduce((sum: number, p: any) => sum + p.amount, 0)
      const totalPenalties = penalties
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      // Calculate monthly revenue (current month)
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const monthlyRevenue = payments
        .filter((p: any) => {
          const paymentDate = new Date(p.created_at)
          return p.payment_status === 'completed' &&
                 paymentDate.getMonth() === currentMonth &&
                 paymentDate.getFullYear() === currentYear
        })
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      const activeRentals = rentals.filter((r: any) => r.status === 'active').length

      // Calculate average duration (in minutes)
      const completedRentals = rentals.filter((r: any) => r.status === 'completed' || r.status === 'completed_with_penalty')
      const averageDuration = completedRentals.length > 0
        ? completedRentals.reduce((sum: number, r: any) => {
            const start = new Date(r.start_time).getTime()
            const end = new Date(r.end_time).getTime()
            return sum + (end - start) / (1000 * 60)
          }, 0) / completedRentals.length
        : 0

      // Find popular bike type
      const bikeTypeCount: Record<string, number> = {}
      rentals.forEach((r: any) => {
        if (r.bike_type?.name) {
          bikeTypeCount[r.bike_type.name] = (bikeTypeCount[r.bike_type.name] || 0) + 1
        }
      })
      const popularBikeType = Object.entries(bikeTypeCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

      setStats({
        totalRentals,
        totalRevenue,
        totalPenalties,
        monthlyRevenue,
        activeRentals,
        averageDuration,
        popularBikeType
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours} jam ${mins} menit`
    }
    return `${mins} menit`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Peminjaman</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalRentals}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Pendapatan</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Pendapatan Bulan Ini</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Denda</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalPenalties)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BikeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Peminjaman Aktif</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.activeRentals}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rata-rata Durasi</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDuration(stats.averageDuration)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Sepeda Terpopuler</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.popularBikeType}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rata-rata per Transaksi</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalRentals > 0
                        ? formatCurrency(stats.totalRevenue / stats.totalRentals)
                        : 'Rp 0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Fitur Analytics Lengkap
              </h3>
              <p className="text-blue-800">
                Analytics saat ini menampilkan statistik dasar. Untuk analytics yang lebih mendetail,
                dapat ditambahkan:
              </p>
              <ul className="mt-3 space-y-2 text-blue-800">
                <li>• Grafik pendapatan harian/mingguan/bulanan</li>
                <li>• Heatmap jam operasional</li>
                <li>• Analisis tren pengguna</li>
                <li>• Prediksi permintaan sepeda</li>
                <li>• Laporan konversi peminjaman</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
