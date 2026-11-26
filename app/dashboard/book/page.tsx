'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bike, Clock, DollarSign, ArrowLeft, User, Zap, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BikeType {
  id: string
  name: string
  hourly_rate: number
  description: string | null
}

export default function BookBikePage() {
  const router = useRouter()
  const [bikeTypes, setBikeTypes] = useState<BikeType[]>([])
  const [selectedBikeType, setSelectedBikeType] = useState<string | null>(null)
  const [duration, setDuration] = useState(1)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBikeTypes()
    checkPendingRental()
  }, [])

  const checkPendingRental = async () => {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/rentals?user_id=${user.id}&status=pending_payment`)
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        // User has pending rental, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking pending rental:', error)
    }
  }

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
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bike_type_id: selectedBikeType,
          duration: duration
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="font-display text-2xl font-bold text-slate-900">Pinjam Sepeda</h1>
            </div>
            <Link href="/dashboard" className="flex items-center">
              <img
                src="/logo.png"
                alt="BikeShare Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1E3A8A] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Memuat jenis sepeda...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pilih Jenis Sepeda */}
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-6">
                Pilih Jenis Sepeda
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bikeTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedBikeType(type.id)}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      selectedBikeType === type.id
                        ? 'ring-4 ring-[#1E3A8A] shadow-2xl scale-[1.02]'
                        : 'shadow-lg border border-slate-200/60'
                    }`}
                  >
                    <div className={`${getBikeImage(type.name)} p-6 text-white relative`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative flex items-center justify-center mb-4">
                        {getBikeIcon(type.name)}
                      </div>
                      <h3 className="relative text-lg font-bold text-center mb-2">
                        {type.name}
                      </h3>
                      <p className="relative text-sm text-center opacity-90 mb-3">
                        {type.description}
                      </p>
                      <div className="relative text-center">
                        <span className="text-2xl font-bold">
                          {formatCurrency(type.hourly_rate)}
                        </span>
                        <span className="text-sm">/jam</span>
                      </div>
                    </div>
                    {selectedBikeType === type.id && (
                      <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-lg">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Durasi Peminjaman */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-6">
                Durasi Peminjaman
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Pilih durasi (1-3 jam)
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          duration === hours
                            ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-lg scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-6">
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Jenis Sepeda</span>
                    <span className="font-semibold text-slate-900">
                      {bikeTypes.find(type => type.id === selectedBikeType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Durasi</span>
                    <span className="font-semibold text-slate-900">{duration} Jam</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Harga per Jam</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(bikeTypes.find(type => type.id === selectedBikeType)?.hourly_rate || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4">
                    <span className="text-slate-900 font-semibold">Total Biaya</span>
                    <span className="text-2xl font-bold text-[#1E3A8A]">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookBike}
                  disabled={bookingLoading}
                  className="w-full mt-6 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white py-4 rounded-xl hover:from-[#1E40AF] hover:to-[#3B82F6] transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-display font-semibold text-slate-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Informasi Peminjaman
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  Durasi peminjaman maksimal 3 jam
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  Dapat diperpanjang maksimal 2 kali (1 jam per perpanjangan)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  Pembayaran dilakukan di muka (prepaid)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  Jam operasional: 06:00 - 19:00
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  Keterlambatan akan dikenakan denda Rp 100.000
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}