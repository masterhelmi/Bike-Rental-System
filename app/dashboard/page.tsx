'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, LogOut, History, Plus, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RentalCard } from '@/components/dashboard/RentalCard'
import { QueueStatus } from '@/components/dashboard/QueueStatus'
import { RentalWithDetails, QueueWithDetails } from '@/lib/types/database'

export default function DashboardPage() {
  const [activeRental, setActiveRental] = useState<RentalWithDetails | null>(null)
  const [pendingRental, setPendingRental] = useState<RentalWithDetails | null>(null)
  const [queue, setQueue] = useState<QueueWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  // Refresh data when component mounts or after booking
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserData()
    }, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const userId = user.id

      // Fetch active rental (not pending_payment) or overdue
      const rentalResponse = await fetch(`/api/rentals?user_id=${userId}`)
      const rentalData = await rentalResponse.json()
      const rentals = rentalData.data || []

      // Find active or overdue rental
      const activeOrOverdue = rentals.find((r: any) => r.status === 'active' || r.status === 'overdue')
      setActiveRental(activeOrOverdue || null)

      // Fetch pending rental
      const pendingResponse = await fetch(`/api/rentals?user_id=${userId}&status=pending_payment`)
      const pendingData = await pendingResponse.json()
      if (pendingData.data && pendingData.data.length > 0) {
        setPendingRental(pendingData.data[0])
      } else {
        setPendingRental(null)
      }

      // Fetch queue status
      const queueResponse = await fetch(`/api/queue?user_id=${userId}`)
      const queueData = await queueResponse.json()
      if (queueData.data && queueData.data.length > 0) {
        setQueue(queueData.data[0])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRental = async () => {
    // Only admin can complete rentals
    console.log('Complete rental can only be done by admin')
  }

  const handleCancelRental = async () => {
    if (!activeRental) return

    if (!confirm('Apakah Anda yakin ingin membatalkan peminjaman ini?')) return

    try {
      const response = await fetch(`/api/rentals/${activeRental.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        setActiveRental(null)
        alert('Peminjaman dibatalkan.')
      } else {
        alert('Gagal membatalkan peminjaman')
      }
    } catch (error) {
      console.error('Error cancelling rental:', error)
      alert('Terjadi kesalahan saat membatalkan peminjaman')
    }
  }

  const handleCancelPendingRental = async () => {
    if (!pendingRental) return

    if (!confirm('Apakah Anda yakin ingin membatalkan peminjaman ini?')) return

    try {
      const response = await fetch(`/api/rentals/${pendingRental.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        setPendingRental(null)
        fetchUserData() // Refresh data immediately
        alert('Peminjaman dibatalkan.')
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal membatalkan peminjaman')
      }
    } catch (error) {
      console.error('Error cancelling pending rental:', error)
      alert('Terjadi kesalahan saat membatalkan peminjaman')
    }
  }

  const handleLeaveQueue = async () => {
    if (!queue) return

    if (!confirm('Apakah Anda yakin ingin keluar dari antrian?')) return

    try {
      const response = await fetch(`/api/queue/${queue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        setQueue(null)
        alert('Anda telah keluar dari antrian.')
      } else {
        alert('Gagal keluar dari antrian')
      }
    } catch (error) {
      console.error('Error leaving queue:', error)
      alert('Terjadi kesalahan saat keluar dari antrian')
    }
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
              <h1 className="text-2xl font-bold text-gray-900">BikeShare</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/history"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <History className="w-4 h-4" />
                Riwayat
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Kelola peminjaman sepeda Anda</p>
        </div>

        {/* Pending Payment Alert - Full Width */}
        {pendingRental && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 mb-1">
                  Menunggu Pembayaran
                </h3>
                <p className="text-yellow-800">
                  Anda memiliki peminjaman yang menunggu pembayaran. Silakan selesaikan pembayaran untuk memulai peminjaman.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Rental - Full Width when exists */}
          {pendingRental ? (
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Peminjaman</h3>
              <RentalCard
                rental={pendingRental}
                onCancel={handleCancelPendingRental}
              />
            </div>
          ) : (
            <>
              {/* Active Rental */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Peminjaman Aktif</h3>
                {activeRental ? (
                  <RentalCard
                    rental={activeRental}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="text-center py-8">
                      <Bike className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Tidak Ada Peminjaman Aktif
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Anda belum meminjam sepeda saat ini.
                      </p>
                      <Link
                        href="/dashboard/book"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Pinjam Sepeda
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Queue Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Antrian</h3>
                <QueueStatus queue={queue} onLeaveQueue={handleLeaveQueue} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}