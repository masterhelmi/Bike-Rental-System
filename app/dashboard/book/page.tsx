'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bike, Clock, DollarSign, ArrowLeft, User, Zap, Check } from 'lucide-react'

interface BikeType {
  id: string
  name: string
  hourly_rate: number
  description: string | null
}

export default function BookBikePage() {
  const [bikeTypes, setBikeTypes] = useState<BikeType[]>([])
  const [selectedBikeType, setSelectedBikeType] = useState<string | null>(null)
  const [duration, setDuration] = useState(1)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBikeTypes()
  }, [])

  const fetchBikeTypes = async () => {
    try {
      const response = await fetch('/api/bike-types')
      const data = await response.json()
      setBikeTypes(data.data || [])
    } catch (error) {
      console.error('Error fetching bike types:', error)
      setError('Gagal memuat jenis sepeda. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleBookBike = async () => {
    if (!selectedBikeType) {
      setError('Pilih jenis sepeda terlebih dahulu')
      return
    }

    if (duration < 1 || duration > 3) {
      setError('Durasi peminjaman harus antara 1-3 jam')
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
          bike_type_id: selectedBikeType
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

  const getBikeIcon = (name: string) => {
    if (name.includes('Listrik')) {
      return <Zap className="w-12 h-12 text-yellow-500" />
    } else if (name.includes('2 Orang')) {
      return <User className="w-12 h-12 text-blue-500" />
    } else {
      return <Bike className="w-12 h-12 text-green-500" />
    }
  }

  const getBikeImage = (name: string) => {
    if (name.includes('Listrik')) {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500'
    } else if (name.includes('2 Orang')) {
      return 'bg-gradient-to-br from-blue-400 to-blue-600'
    } else {
      return 'bg-gradient-to-br from-green-400 to-green-600'
    }
  }

  const calculateTotal = () => {
    const selectedType = bikeTypes.find(type => type.id === selectedBikeType)
    if (!selectedType) return 0
    return selectedType.hourly_rate * duration
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Pinjam Sepeda</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat jenis sepeda...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pilih Jenis Sepeda */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pilih Jenis Sepeda
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bikeTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedBikeType(type.id)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                      selectedBikeType === type.id
                        ? 'ring-4 ring-blue-500 shadow-xl'
                        : 'shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className={`${getBikeImage(type.name)} p-6 text-white`}>
                      <div className="flex items-center justify-center mb-4">
                        {getBikeIcon(type.name)}
                      </div>
                      <h3 className="text-lg font-bold text-center mb-2">
                        {type.name}
                      </h3>
                      <p className="text-sm text-center opacity-90 mb-3">
                        {type.description}
                      </p>
                      <div className="text-center">
                        <span className="text-2xl font-bold">
                          {formatCurrency(type.hourly_rate)}
                        </span>
                        <span className="text-sm">/jam</span>
                      </div>
                    </div>
                    {selectedBikeType === type.id && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Durasi Peminjaman */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Durasi Peminjaman
              </h2>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih durasi (1-3 jam)
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          duration === hours
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {hours} Jam
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            {selectedBikeType && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Jenis Sepeda</span>
                    <span className="font-medium text-gray-900">
                      {bikeTypes.find(type => type.id === selectedBikeType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Durasi</span>
                    <span className="font-medium text-gray-900">{duration} Jam</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Harga per Jam</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(bikeTypes.find(type => type.id === selectedBikeType)?.hourly_rate || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                    <span className="text-gray-900 font-semibold">Total Biaya</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookBike}
                  disabled={bookingLoading}
                  className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Bike className="w-5 h-5" />
                      Pinjam Sekarang
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Info Tambahan */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Informasi Peminjaman
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Durasi peminjaman maksimal 3 jam</li>
                <li>• Dapat diperpanjang maksimal 2 kali (1 jam per perpanjangan)</li>
                <li>• Pembayaran dilakukan di muka (prepaid)</li>
                <li>• Jam operasional: 06:00 - 19:00</li>
                <li>• Keterlambatan akan dikenakan denda Rp 100.000</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}