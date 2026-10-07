'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, Clock, DollarSign, ArrowLeft, MapPin } from 'lucide-react'

interface BikeType {
  id: string
  name: string
  hourly_rate: number
  description: string | null
}

interface Bike {
  id: string
  bike_code: string
  bike_type_id: string | null
  status: string
  current_location: string | null
  bike_type?: BikeType
}

export default function BookBikePage() {
  const [bikeTypes, setBikeTypes] = useState<BikeType[]>([])
  const [bikes, setBikes] = useState<Bike[]>([])
  const [selectedBikeType, setSelectedBikeType] = useState<string | null>(null)
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBikeTypes()
    fetchAvailableBikes()
  }, [])

  const fetchBikeTypes = async () => {
    try {
      const response = await fetch('/api/bike-types')
      const data = await response.json()
      setBikeTypes(data.data || [])
    } catch (error) {
      console.error('Error fetching bike types:', error)
    }
  }

  const fetchAvailableBikes = async (bikeTypeId?: string) => {
    try {
      setLoading(true)
      const url = bikeTypeId 
        ? `/api/bikes?available=true&bike_type_id=${bikeTypeId}`
        : '/api/bikes?available=true'
      
      const response = await fetch(url)
      const data = await response.json()
      setBikes(data.data || [])
    } catch (error) {
      console.error('Error fetching bikes:', error)
      setError('Gagal memuat sepeda. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleBikeTypeChange = (bikeTypeId: string) => {
    setSelectedBikeType(bikeTypeId)
    setSelectedBike(null)
    fetchAvailableBikes(bikeTypeId)
  }

  const handleBikeSelect = (bike: Bike) => {
    setSelectedBike(bike)
  }

  const handleBookBike = async () => {
    if (!selectedBike) {
      setError('Pilih sepeda terlebih dahulu')
      return
    }

    setBookingLoading(true)
    setError('')

    try {
      // TODO: Get actual user ID from auth
      const userId = 'user-id-placeholder'
      
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bike_id: selectedBike.id,
          bike_type_id: selectedBike.bike_type_id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Gagal memesan sepeda')
        return
      }

      alert('Pemesanan berhasil! Anda akan diarahkan ke dashboard.')
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Booking error:', error)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setBookingLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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
            <h1 className="text-2xl font-bold text-gray-900">Pinjam Sepeda</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pilih Jenis Sepeda
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setSelectedBikeType(null)
                fetchAvailableBikes()
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedBikeType === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Semua
            </button>
            {bikeTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleBikeTypeChange(type.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedBikeType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat sepeda...</p>
          </div>
        ) : bikes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <Bike className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak Ada Sepeda Tersedia
            </h3>
            <p className="text-gray-600">
              {selectedBikeType 
                ? 'Tidak ada sepeda jenis ini yang tersedia saat ini.'
                : 'Tidak ada sepeda yang tersedia saat ini. Silakan cek lagi nanti.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.map((bike) => (
              <div
                key={bike.id}
                onClick={() => handleBikeSelect(bike)}
                className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedBike?.id === bike.id
                    ? 'border-blue-600 ring-2 ring-blue-600'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bike.bike_code}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bike.bike_type?.name || 'Unknown Type'}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Tersedia
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{bike.current_location || 'Main Station'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Durasi: 1 jam</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(bike.bike_type?.hourly_rate || 5000)}/jam
                    </span>
                  </div>
                </div>

                {bike.bike_type?.description && (
                  <p className="text-sm text-gray-500 mb-4">
                    {bike.bike_type.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Booking Summary */}
        {selectedBike && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedBike.bike_code} - {selectedBike.bike_type?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(selectedBike.bike_type?.hourly_rate || 5000)} untuk 1 jam
                  </p>
                </div>
                <button
                  onClick={handleBookBike}
                  disabled={bookingLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Memproses...' : 'Pinjam Sekarang'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}