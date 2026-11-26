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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1E3A8A] rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Memuat dashboard...</p>
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
            <Link href="/dashboard" className="flex items-center">
              <img
                src="/logo.png"
                alt="BikeShare Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/history"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-medium"
              >
                <History className="w-4 h-4" />
                Riwayat
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
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Kelola peminjaman sepeda Anda</p>
        </div>

        {/* Pending Payment Alert - Full Width */}
        {pendingRental && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 rounded-full p-3">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 mb-1">
                  Menunggu Pembayaran
                </h3>
                <p className="text-amber-800">
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
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-4">Detail Peminjaman</h3>
              <RentalCard
                rental={pendingRental}
                onCancel={handleCancelPendingRental}
              />
            </div>
          ) : (
            <>
              {/* Active Rental */}
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-4">Peminjaman Aktif</h3>
                {activeRental ? (
                  <RentalCard
                    rental={activeRental}
                  />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200/60 backdrop-blur-sm">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bike className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
                        Tidak Ada Peminjaman Aktif
                      </h3>
                      <p className="text-sm text-slate-600 mb-6">
                        Anda belum meminjam sepeda saat ini.
                      </p>
                      <Link
                        href="/dashboard/book"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-6 py-3 rounded-xl hover:from-[#1E40AF] hover:to-[#3B82F6] transition-all text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
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
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-4">Status Antrian</h3>
                <QueueStatus queue={queue} onLeaveQueue={handleLeaveQueue} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}