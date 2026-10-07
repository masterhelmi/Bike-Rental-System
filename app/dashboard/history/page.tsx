'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Bike, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface RentalWithDetails {
  id: string
  start_time: string
  end_time: string
  actual_end_time: string | null
  duration_minutes: number | null
  status: string
  total_amount: number
  paid_amount: number
  payment_status: string
  bike?: {
    bike_code: string
    bike_type?: {
      name: string
      hourly_rate: number
    }
  }
}

export default function HistoryPage() {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      // TODO: Get actual user ID from auth
      const userId = 'user-id-placeholder'
      
      const response = await fetch(`/api/rentals?user_id=${userId}`)
      const data = await response.json()
      setRentals(data.data || [])
    } catch (error) {
      console.error('Error fetching rentals:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'completed':
        return 'Selesai'
      case 'overdue':
        return 'Terlambat'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-gray-600 mb-4">
              Anda belum pernah meminjam sepeda.
            </p>
            <Link
              href="/dashboard/book"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Bike className="w-4 h-4" />
              Pinjam Sepeda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rental.bike?.bike_code || 'Sepeda #' + rental.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {rental.bike?.bike_type?.name || 'Unknown Type'}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                    {getStatusIcon(rental.status)}
                    {getStatusText(rental.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Mulai</div>
                      <div>{formatDate(rental.start_time)}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Selesai</div>
                      <div>
                        {rental.actual_end_time
                          ? formatDate(rental.actual_end_time)
                          : formatDate(rental.end_time)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Bike className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Durasi</div>
                      <div>
                        {rental.duration_minutes
                          ? `${rental.duration_minutes} menit`
                          : '1 jam'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <div>
                      <span className="font-medium">Total: </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(rental.total_amount)}
                      </span>
                      {rental.paid_amount > 0 && (
                        <span className="text-gray-500">
                          {' '} (Dibayar: {formatCurrency(rental.paid_amount)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rental.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : rental.payment_status === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rental.payment_status === 'paid'
                      ? 'Lunas'
                      : rental.payment_status === 'partial'
                      ? 'Sebagian'
                      : 'Belum Bayar'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}