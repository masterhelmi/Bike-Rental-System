'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, LogOut, Settings, BarChart3, Users, DollarSign } from 'lucide-react'
import { StatsCards } from '@/components/admin/StatsCards'
import { BikeTable } from '@/components/admin/BikeTable'
import { BikeWithType } from '@/lib/types/database'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBikes: 0,
    availableBikes: 0,
    activeRentals: 0,
    queueLength: 0,
    todayRevenue: 0
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

      // Calculate stats
      const totalBikes = bikesData.data?.length || 0
      const availableBikes = bikesData.data?.filter((b: BikeWithType) => b.status === 'available').length || 0

      // TODO: Fetch other stats from appropriate endpoints
      setStats({
        totalBikes,
        availableBikes,
        activeRentals: 0, // TODO: Fetch from rentals API
        queueLength: 0, // TODO: Fetch from queue API
        todayRevenue: 0 // TODO: Fetch from payments API
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bike className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BikeShare Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Admin</h2>
          <p className="text-gray-600">Overview sistem peminjaman sepeda</p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalBikes={stats.totalBikes}
          availableBikes={stats.availableBikes}
          activeRentals={stats.activeRentals}
          queueLength={stats.queueLength}
          todayRevenue={stats.todayRevenue}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/admin/rentals"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Persetujuan Peminjaman</h3>
            </div>
            <p className="text-sm text-gray-600">
              Setujui atau tolak permintaan peminjaman
            </p>
          </Link>

          <Link
            href="/admin/queue"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Kelola Antrian</h3>
            </div>
            <p className="text-sm text-gray-600">
              Atur dan prioritaskan antrian user
            </p>
          </Link>

          <Link
            href="/admin/transactions"
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Transaksi</h3>
            </div>
            <p className="text-sm text-gray-600">
              Lihat riwayat transaksi dan pendapatan
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
          />
        </div>
      </main>
    </div>
  )
}