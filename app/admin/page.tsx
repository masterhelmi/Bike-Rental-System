'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, LogOut, Settings, BarChart3, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { StatsCards } from '@/components/admin/StatsCards'
import { BikeTable } from '@/components/admin/BikeTable'
import { BikeWithType } from '@/lib/types/database'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBikes: 0,
    availableBikes: 0,
    activeRentals: 0,
    queueLength: 0,
    todayRevenue: 0,
    todayPenalties: 0
  })
  const [bikes, setBikes] = useState<BikeWithType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch bikes
      const bikesResponse = await fetch('/api/bikes')
      const bikesData = await bikesResponse.json()
      setBikes(bikesData.data || [])

      // Fetch rentals
      const rentalsResponse = await fetch('/api/rentals')
      const rentalsData = await rentalsResponse.json()
      const rentals = rentalsData.data || []

      // Fetch queue
      const queueResponse = await fetch('/api/queue')
      const queueData = await queueResponse.json()
      const queue = queueData.data || []

      // Fetch payments
      const paymentsResponse = await fetch('/api/payments')
      const paymentsData = await paymentsResponse.json()
      const payments = paymentsData.data || []

      // Fetch penalties
      const penaltiesResponse = await fetch('/api/penalties')
      const penaltiesData = await penaltiesResponse.json()
      const penalties = penaltiesData.data || []

      // Calculate stats
      const totalBikes = bikesData.data?.length || 0
      const availableBikes = bikesData.data?.filter((b: BikeWithType) => b.status === 'available').length || 0
      const activeRentals = rentals.filter((r: any) => r.status === 'active').length
      const queueLength = queue.filter((q: any) => q.status === 'waiting').length

      // Calculate today's revenue
      const today = new Date().toISOString().split('T')[0]
      const todayRevenue = payments
        .filter((p: any) => p.payment_status === 'completed' && p.created_at.startsWith(today))
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      // Calculate today's penalties
      const todayPenalties = penalties
        .filter((p: any) => p.created_at.startsWith(today))
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      setStats({
        totalBikes,
        availableBikes,
        activeRentals,
        queueLength,
        todayRevenue,
        todayPenalties
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBike = (bike: BikeWithType) => {
    // TODO: Implement edit modal
    console.log('Edit bike:', bike)
  }

  const handleDeleteBike = async (bikeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sepeda ini?')) return

    try {
      const response = await fetch(`/api/bikes/${bikeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBikes(bikes.filter(b => b.id !== bikeId))
        alert('Sepeda berhasil dihapus')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menghapus sepeda')
      }
    } catch (error) {
      console.error('Error deleting bike:', error)
      alert('Terjadi kesalahan saat menghapus sepeda')
    }
  }

  const handleAddBike = () => {
    // TODO: Implement add modal
    console.log('Add bike')
  }

  const handleResetBikeStatus = async (bikeId: string) => {
    if (!confirm('Apakah Anda yakin ingin mereset status sepeda ini ke tersedia?')) return

    try {
      const response = await fetch(`/api/bikes/${bikeId}/reset`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchAdminData() // Refresh data
        alert('Status sepeda berhasil direset ke tersedia')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal mereset status sepeda')
      }
    } catch (error) {
      console.error('Error resetting bike status:', error)
      alert('Terjadi kesalahan saat mereset status sepeda')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1E3A8A] rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Memuat admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="flex items-center">
              <img
                src="/logo.png"
                alt="BikeShare Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Overview sistem peminjaman sepeda</p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalBikes={stats.totalBikes}
          availableBikes={stats.availableBikes}
          activeRentals={stats.activeRentals}
          queueLength={stats.queueLength}
          todayRevenue={stats.todayRevenue}
          todayPenalties={stats.todayPenalties}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Link
            href="/admin/rentals"
            className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Persetujuan</h3>
            </div>
            <p className="text-sm text-slate-600">
              Setujui atau tolak permintaan peminjaman
            </p>
          </Link>

          <Link
            href="/admin/queue"
            className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Kelola Antrian</h3>
            </div>
            <p className="text-sm text-slate-600">
              Atur dan prioritaskan antrian user
            </p>
          </Link>

          <Link
            href="/admin/transactions"
            className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Transaksi</h3>
            </div>
            <p className="text-sm text-slate-600">
              Lihat riwayat transaksi dan pendapatan
            </p>
          </Link>

          <Link
            href="/admin/penalties"
            className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Denda</h3>
            </div>
            <p className="text-sm text-slate-600">
              Kelola denda keterlambatan dan waiving
            </p>
          </Link>
        </div>

        {/* Bike Management */}
        <div className="mt-8">
          <BikeTable
            bikes={bikes}
            onEdit={handleEditBike}
            onDelete={handleDeleteBike}
            onAdd={handleAddBike}
            onResetStatus={handleResetBikeStatus}
          />
        </div>
      </main>
    </div>
  )
}