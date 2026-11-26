'use client'

import { RentalWithDetails } from '@/lib/types/database'
import { Clock, Bike, Calendar, CreditCard, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useState, useEffect } from 'react'

interface RentalCardProps {
  rental: RentalWithDetails
  onExtend?: () => void
  onComplete?: () => void
  onCancel?: () => void
}

export function RentalCard({ rental, onExtend, onComplete, onCancel }: RentalCardProps) {
  const isActive = rental.status === 'active'
  const isCompleted = rental.status === 'completed'
  const isCompletedWithPenalty = rental.status === 'completed_with_penalty'
  const isOverdue = rental.status === 'overdue'
  const isCancelled = rental.status === 'cancelled'
  const [notificationShown, setNotificationShown] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [currentPenalty, setCurrentPenalty] = useState(0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = () => {
    if (isOverdue) return 'bg-red-100 text-red-800'
    if (isActive) return 'bg-green-100 text-green-800'
    if (isCompleted) return 'bg-[#DBEAFE] text-[#1E3A8A]'
    if (isCompletedWithPenalty) return 'bg-orange-100 text-orange-800'
    if (isCancelled) return 'bg-gray-100 text-gray-800'
    if (rental.status === 'pending_payment') return 'bg-yellow-100 text-yellow-800'
    if (rental.status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = () => {
    if (isOverdue) return 'Terlambat'
    if (isActive) return 'Aktif'
    if (isCompleted) return 'Selesai'
    if (isCompletedWithPenalty) return 'Selesai dengan Denda'
    if (isCancelled) return 'Dibatalkan'
    if (rental.status === 'pending_payment') return 'Menunggu Pembayaran'
    if (rental.status === 'rejected') return 'Ditolak'
    return rental.status
  }

  const calculateCurrentPenalty = () => {
    if (!isActive || !rental.end_time) return 0
    const endTime = new Date(rental.end_time)
    const now = new Date()
    const overdueMs = now.getTime() - endTime.getTime()

    if (overdueMs <= 0) return 0

    const overdueMinutes = Math.floor(overdueMs / (1000 * 60))

    // Apply same logic as SQL function
    if (overdueMinutes <= 5) return 0
    if (overdueMinutes <= 10) return 10000
    if (overdueMinutes <= 30) return 20000
    if (overdueMinutes <= 60) return 50000
    return 100000
  }

  const calculateRemainingTime = () => {
    if (!isActive || !rental.end_time) return null
    const endTime = new Date(rental.end_time)
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()

    if (diff <= 0) return 'Waktu habis'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}j ${minutes}m`
    }
    return `${minutes}m`
  }

  const getRemainingMinutes = () => {
    if (!isActive || !rental.end_time) return null
    const endTime = new Date(rental.end_time)
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()

    if (diff <= 0) return 0

    const minutes = Math.floor(diff / (1000 * 60))
    return minutes
  }

  useEffect(() => {
    if (!isActive) return

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkTime = () => {
      const remainingMinutes = getRemainingMinutes()
      if (remainingMinutes !== null && remainingMinutes <= 10 && remainingMinutes > 0 && !notificationShown) {
        setShowWarning(true)
        setNotificationShown(true)
        // Play notification sound or show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Peringatan Waktu', {
            body: 'Sisa waktu peminjaman tinggal 10 menit!',
            icon: '/icon.png'
          })
        }
      }

      // Update current penalty when overdue
      const penalty = calculateCurrentPenalty()
      setCurrentPenalty(penalty)
    }

    checkTime()
    const interval = setInterval(checkTime, 1000) // Check every second

    return () => clearInterval(interval)
  }, [isActive, rental.end_time, notificationShown])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {rental.bike?.bike_code || 'Sepeda #' + rental.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-600">
            {rental.bike?.bike_type?.name || 'Unknown Type'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {format(new Date(rental.start_time), 'dd MMM yyyy, HH:mm', { locale: id })}
          </span>
        </div>

        {isActive && (
          <>
            {showWarning && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-900 text-sm">
                    Peringatan Waktu!
                  </p>
                  <p className="text-red-700 text-xs">
                    Sisa waktu peminjaman tinggal 10 menit lagi. Segera kembalikan sepeda.
                  </p>
                </div>
              </div>
            )}

            {currentPenalty > 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-orange-900 text-sm">
                    Terlambat Mengembalikan!
                  </p>
                  <p className="text-orange-700 text-xs">
                    Denda saat ini: <span className="font-bold">{formatCurrency(currentPenalty)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Sisa waktu: <span className="font-bold text-2xl text-red-600">
                  {calculateRemainingTime()}
                </span>
              </span>
            </div>
          </>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Bike className="w-4 h-4 mr-2" />
          <span>
            Durasi: {rental.duration_minutes ? `${rental.duration_minutes} menit` : '60 menit'}
            {rental.is_extended && ` (${rental.extension_count}x perpanjangan)`}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CreditCard className="w-4 h-4 mr-2" />
          <span>
            Total: <span className="font-semibold text-gray-900">
              {formatCurrency(rental.total_amount)}
            </span>
            {rental.paid_amount > 0 && ` (Dibayar: ${formatCurrency(rental.paid_amount)})`}
          </span>
        </div>

        {isCompletedWithPenalty && rental.penalty_amount > 0 && (
          <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>
              Denda: <span className="font-bold">{formatCurrency(rental.penalty_amount)}</span>
              <span className="text-xs ml-1">({rental.overdue_minutes} menit terlambat)</span>
            </span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Peminjaman sedang berlangsung
          </p>
        </div>
      )}

      {isOverdue && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-red-500 text-center">
            Peminjaman terlambat. Hubungi admin untuk pengembalian.
          </p>
        </div>
      )}

      {rental.status === 'pending_payment' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Menunggu persetujuan admin</strong>
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Batalkan
            </button>
          )}
        </div>
      )}

      {rental.status === 'rejected' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 text-center">
              <strong>Peminjaman ditolak admin</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}