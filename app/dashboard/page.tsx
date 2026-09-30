'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, LogOut, History, Plus } from 'lucide-react'
import { RentalCard } from '@/components/dashboard/RentalCard'
import { QueueStatus } from '@/components/dashboard/QueueStatus'
import { RentalWithDetails, QueueWithDetails } from '@/lib/types/database'

export default function DashboardPage() {
  const [activeRental, setActiveRental] = useState<RentalWithDetails | null>(null)
  const [queue, setQueue] = useState<QueueWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // TODO: Get user ID from auth
      const userId = 'user-id-placeholder' // Replace with actual user ID

      // Fetch active rental
      const rentalResponse = await fetch(`/api/rentals?user_id=${userId}&status=active`)
      const rentalData = await rentalResponse.json()
      if (rentalData.data && rentalData.data.length > 0) {
        setActiveRental(rentalData.data[0])
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

  const handleExtendRental = async () => {
    if (!activeRental) return

    try {
      const response = await fetch('/api/rentals/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rental_id: activeRental.id })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveRental(data.data)
        alert('Peminjaman berhasil diperpanjang!')
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal memperpanjang peminjaman')
      }
    } catch (error) {
      console.error('Error extending rental:', error)
      alert('Terjadi kesalahan saat memperpanjang peminjaman')
    }
  }

  const handleCompleteRental = async () => {
    if (!activeRental) return

    try {
      const response = await fetch(`/api/rentals/${activeRental.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      })

      if (response.ok) {
        setActiveRental(null)
        alert('Peminjaman selesai! Terima kasih.')
      } else {
        alert('Gagal menyelesaikan peminjaman')
      }
    } catch (error) {
      console.error('Error completing rental:', error)
      alert('Terjadi kesalahan saat menyelesaikan peminjaman')
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Rental */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peminjaman Aktif</h3>
            {activeRental ? (
              <RentalCard
                rental={activeRental}
                onExtend={handleExtendRental}
                onComplete={handleCompleteRental}
                onCancel={handleCancelRental}
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
        </div>
      </main>
    </div>
  )
}