'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, Bike as BikeIcon, User, Trash2 } from 'lucide-react'

interface QueueWithDetails {
  id: string
  user_id: string
  bike_id: string | null
  bike_type_id: string | null
  position: number
  status: string
  created_at: string
  expires_at: string | null
  user?: {
    full_name: string | null
    phone: string | null
  }
  bike?: {
    bike_code: string
    status: string
  }
  bike_type?: {
    name: string
  }
}

export default function AdminQueuePage() {
  const [queue, setQueue] = useState<QueueWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/queue')
      const data = await response.json()
      setQueue(data.data || [])
    } catch (error) {
      console.error('Error fetching queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (queueId: string) => {
    if (!confirm('Hapus user dari antrian?')) return

    try {
      const response = await fetch(`/api/queue/${queueId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('User dihapus dari antrian')
        fetchQueue()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menghapus dari antrian')
      }
    } catch (error) {
      console.error('Error removing from queue:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleProcessQueue = async () => {
    if (!confirm('Proses antrian dan assign sepeda?')) return

    try {
      const response = await fetch('/api/queue/process', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Antrian diproses')
        fetchQueue()
      } else {
        alert(data.error || 'Gagal memproses antrian')
      }
    } catch (error) {
      console.error('Error processing queue:', error)
      alert('Terjadi kesalahan')
    }
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
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Menunggu'
      case 'assigned':
        return 'Ditugaskan'
      case 'active':
        return 'Aktif'
      case 'expired':
        return 'Kadaluarsa'
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Antrian</h1>
            </div>
            <button
              onClick={handleProcessQueue}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proses Antrian
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{queue.length}</div>
                <div className="text-sm text-gray-600">Total Antrian</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {queue.filter(q => q.status === 'waiting').length}
                </div>
                <div className="text-sm text-gray-600">Menunggu</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <BikeIcon className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {queue.filter(q => q.status === 'assigned').length}
                </div>
                <div className="text-sm text-gray-600">Ditugaskan</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat antrian...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Antrian
            </h3>
            <p className="text-gray-600">
              Tidak ada user yang sedang mengantri saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        #{item.position}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.user?.full_name || 'Unknown User'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.user?.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BikeIcon className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Jenis Sepeda</div>
                      <div>{item.bike_type?.name || 'Any'}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Waktu Masuk</div>
                      <div>{formatDate(item.created_at)}</div>
                    </div>
                  </div>

                  {item.expires_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <div>
                        <div className="font-medium">Kadaluarsa</div>
                        <div>{formatDate(item.expires_at)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
