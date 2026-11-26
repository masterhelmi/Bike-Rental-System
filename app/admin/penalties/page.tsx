'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, DollarSign } from 'lucide-react'

interface Penalty {
  id: string
  rental_id: string
  user_id: string
  amount: number
  overdue_minutes: number
  penalty_tier: string
  status: string
  created_at: string
  paid_at: string | null
  waived_by: string | null
  waived_reason: string | null
  rental?: {
    bike?: {
      bike_code: string
    }
  }
  user?: {
    full_name: string | null
    email: string | null
  }
}

export default function AdminPenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'waived'>('all')

  useEffect(() => {
    fetchPenalties()
  }, [filter])

  const fetchPenalties = async () => {
    try {
      const url = filter === 'all'
        ? '/api/penalties'
        : `/api/penalties?status=${filter}`

      const response = await fetch(url)
      const data = await response.json()
      setPenalties(data.data || [])
    } catch (error) {
      console.error('Error fetching penalties:', error)
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'waived':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran'
      case 'paid':
        return 'Lunas'
      case 'waived':
        return 'Dimaafkan'
      default:
        return status
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'light':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'heavy':
        return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'severe':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getTierText = (tier: string) => {
    switch (tier) {
      case 'light':
        return 'Ringan'
      case 'medium':
        return 'Sedang'
      case 'heavy':
        return 'Berat'
      case 'severe':
        return 'Parah'
      default:
        return tier
    }
  }

  const handleWaivePenalty = async (penaltyId: string) => {
    const reason = prompt('Alasan pemaafan denda:')
    if (!reason) return

    try {
      const response = await fetch(`/api/penalties/${penaltyId}/waive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        alert('Denda berhasil dimaafkan')
        fetchPenalties()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal memaafkan denda')
      }
    } catch (error) {
      console.error('Error waiving penalty:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handlePayPenalty = async (penaltyId: string) => {
    if (!confirm('Tandai denda ini sebagai lunas?')) return

    try {
      const response = await fetch(`/api/penalties/${penaltyId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'cash' })
      })

      if (response.ok) {
        alert('Denda berhasil ditandai lunas')
        fetchPenalties()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menandai denda lunas')
      }
    } catch (error) {
      console.error('Error paying penalty:', error)
      alert('Terjadi kesalahan')
    }
  }

  const totalPenalties = penalties
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Denda</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPenalties)}
                </div>
                <div className="text-sm text-gray-600">Denda Menunggu Pembayaran</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {penalties.filter(p => p.status === 'paid').length}
                </div>
                <div className="text-sm text-gray-600">Denda Lunas</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {penalties.filter(p => p.status === 'waived').length}
                </div>
                <div className="text-sm text-gray-600">Denda Dimaafkan</div>
              </div>
            </div>
          </div>
        </div>

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
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Lunas
            </button>
            <button
              onClick={() => setFilter('waived')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'waived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Dimaafkan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat denda...</p>
          </div>
        ) : penalties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Denda
            </h3>
            <p className="text-gray-600">
              Belum ada denda yang tercatat.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sepeda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterlambatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map((penalty) => (
                  <tr key={penalty.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {penalty.user?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {penalty.user?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {penalty.rental?.bike?.bike_code || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(penalty.penalty_tier)}`}>
                        {getTierText(penalty.penalty_tier)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {penalty.overdue_minutes} menit
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(penalty.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(penalty.status)}`}>
                        {getStatusText(penalty.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(penalty.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {penalty.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePayPenalty(penalty.id)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Bayar
                          </button>
                          <button
                            onClick={() => handleWaivePenalty(penalty.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Maafkan
                          </button>
                        </div>
                      )}
                      {penalty.status === 'waived' && penalty.waived_reason && (
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={penalty.waived_reason}>
                          {penalty.waived_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
