'use client'

import { QueueWithDetails } from '@/lib/types/database'
import { Users, Clock, Bike as BikeIcon, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface QueueStatusProps {
  queue: QueueWithDetails | null
  onLeaveQueue?: () => void
}

export function QueueStatus({ queue, onLeaveQueue }: QueueStatusProps) {
  if (!queue) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tidak Sedang Antri
          </h3>
          <p className="text-sm text-gray-600">
            Anda belum bergabung ke antrian. Pilih sepeda untuk memulai antrian.
          </p>
        </div>
      </div>
    )
  }

  const isWaiting = queue.status === 'waiting'
  const isNotified = queue.status === 'notified'
  const isAssigned = queue.status === 'assigned'
  const isExpired = queue.status === 'expired'

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'HH:mm', { locale: id })
  }

  const getStatusColor = () => {
    if (isExpired) return 'bg-red-100 text-red-800'
    if (isAssigned) return 'bg-green-100 text-green-800'
    if (isNotified) return 'bg-yellow-100 text-yellow-800'
    if (isWaiting) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = () => {
    if (isExpired) return 'Kadaluarsa'
    if (isAssigned) return 'Ditugaskan'
    if (isNotified) return 'Diberitahu'
    if (isWaiting) return 'Menunggu'
    return queue.status
  }

  const calculateEstimatedWait = () => {
    if (!isWaiting || !queue.position) return null
    // Estimate: 1 hour per person ahead
    const estimatedMinutes = queue.position * 60
    const hours = Math.floor(estimatedMinutes / 60)
    const minutes = estimatedMinutes % 60
    
    if (hours > 0) {
      return `~${hours}j ${minutes}m`
    }
    return `~${minutes}m`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Status Antrian
          </h3>
          <p className="text-sm text-gray-600">
            Posisi: #{queue.position || '-'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {queue.bike && (
          <div className="flex items-center text-sm text-gray-600">
            <BikeIcon className="w-4 h-4 mr-2" />
            <span>
              Sepeda: {queue.bike.bike_code} ({queue.bike.bike_type?.name})
            </span>
          </div>
        )}

        {queue.bike_type && !queue.bike && (
          <div className="flex items-center text-sm text-gray-600">
            <BikeIcon className="w-4 h-4 mr-2" />
            <span>
              Jenis: {queue.bike_type.name}
            </span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            Bergabung: {formatTime(queue.joined_at)}
          </span>
        </div>

        {isNotified && queue.expires_at && (
          <div className="flex items-center text-sm text-yellow-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>
              Kadaluarsa dalam: {formatTime(queue.expires_at)}
            </span>
          </div>
        )}

        {isWaiting && calculateEstimatedWait() && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Estimasi tunggu: {calculateEstimatedWait()}
            </span>
          </div>
        )}
      </div>

      {isNotified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Sepeda tersedia!</strong> Silakan konfirmasi untuk mulai peminjaman.
            Waktu konfirmasi: 15 menit.
          </p>
        </div>
      )}

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>Waktu habis!</strong> Anda melewatkan waktu konfirmasi. Silakan bergabung ke antrian lagi.
          </p>
        </div>
      )}

      {(isWaiting || isNotified) && onLeaveQueue && (
        <button
          onClick={onLeaveQueue}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Keluar Antrian
        </button>
      )}
    </div>
  )
}