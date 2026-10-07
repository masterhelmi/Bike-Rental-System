'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Clock, DollarSign, User, Bike as BikeIcon } from 'lucide-react'

interface RentalWithDetails {
  id: string
  user_id: string
  bike_type_id: string | null
  start_time: string
  end_time: string
  status: string
  total_amount: number
  payment_status: string
  user?: {
    full_name: string | null
    phone: string | null
  }
  bike_type?: {
    name: string
    hourly_rate: number
  }
}

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending_payment' | 'active' | 'completed'>('pending_payment')

  useEffect(() => {
    fetchRentals()
  }, [filter])

  const fetchRentals = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/rentals'
        : `/api/rentals?status=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      setRentals(data.data || [])
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (rentalId: string) => {
    if (!confirm('Setujui peminjaman ini?')) return

    try {
      const response = await fetch(`/api/rentals/${rentalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Gagal menyetujui peminjaman')
        return
      }

      alert('Peminjaman disetujui! Sepeda: ' + data.assigned_bike)
      fetchRentals()
    } catch (error) {
      console.error('Error approving rental:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleReject = async (rentalId: string) => {
    const reason = prompt('Alasan penolakan:')
    if (!reason) return

    try {
      const response = await fetch(`/api/rentals/${rentalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Gagal menolak peminjaman')
        return
      }

      alert('Peminjaman ditolak')
      fetchRentals()
    } catch (error) {
      console.error('Error rejecting rental:', error)
      alert('Terjadi kesalahan')
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
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Menunggu Pembayaran'
      case 'active':
        return 'Aktif'
      case 'completed':
        return 'Selesai'
      case 'overdue':
        return 'Terlambat'
      case 'cancelled':
        return 'Dibatalkan'
      case 'rejected':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Persetujuan Peminjaman</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('pending_payment')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending_payment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Menunggu Pembayaran
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat peminjaman...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Peminjaman
            </h3>
            <p className="text-gray-600">
              {filter === 'pending_payment' 
                ? 'Tidak ada peminjaman yang menunggu persetujuan.'
                : 'Tidak ada peminjaman dengan status ini.'}
            </p>
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
                      {rental.user?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {rental.user?.phone || 'No phone'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                    {getStatusText(rental.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BikeIcon className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Jenis Sepeda</div>
                      <div>{rental.bike_type?.name || 'Unknown'}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Waktu</div>
                      <div>{formatDate(rental.start_time)}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Total</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(rental.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                {rental.status === 'pending_payment' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(rental.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Setujui
                    </button>
                    <button
                      onClick={() => handleReject(rental.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}