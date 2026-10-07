'use client'

import { RentalWithDetails } from '@/lib/types/database'
import { Clock, Bike, Calendar, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface RentalCardProps {
  rental: RentalWithDetails
  onExtend?: () => void
  onComplete?: () => void
  onCancel?: () => void
}

export function RentalCard({ rental, onExtend, onComplete, onCancel }: RentalCardProps) {
  const isActive = rental.status === 'active'
  const isCompleted = rental.status === 'completed'
  const isOverdue = rental.status === 'overdue'
  const isCancelled = rental.status === 'cancelled'

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
    if (isCompleted) return 'bg-blue-100 text-blue-800'
    if (isCancelled) return 'bg-gray-100 text-gray-800'
    if (rental.status === 'pending_payment') return 'bg-yellow-100 text-yellow-800'
    if (rental.status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = () => {
    if (isOverdue) return 'Terlambat'
    if (isActive) return 'Aktif'
    if (isCompleted) return 'Selesai'
    if (isCancelled) return 'Dibatalkan'
    if (rental.status === 'pending_payment') return 'Menunggu Pembayaran'
    if (rental.status === 'rejected') return 'Ditolak'
    return rental.status
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
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Sisa waktu: <span className="font-semibold text-gray-900">
                {calculateRemainingTime()}
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Bike className="w-4 h-4 mr-2" />
          <span>
            Durasi: {rental.duration_minutes ? `${rental.duration_minutes} menit` : '1 jam'}
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
      </div>

      {isActive && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {rental.extension_count < 2 && onExtend && (
            <button
              onClick={onExtend}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Perpanjang (+1j)
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Selesai
            </button>
          )}
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