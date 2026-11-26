'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Save, Clock, DollarSign, Bike as BikeIcon } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    baseExtensionDuration: 60, // minutes
    maxExtensions: 2,
    fineAmount: 100000, // rupiah
    operationalHours: {
      open: '06:00',
      close: '19:00'
    }
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      // In production, this would save to database
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Pengaturan berhasil disimpan!')
    } catch (error) {
      setMessage('Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('berhasil')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="max-w-3xl">
          {/* Extension Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pengaturan Perpanjangan</h2>
                <p className="text-sm text-gray-600">Atur durasi dan batas perpanjangan peminjaman</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Perpanjangan (menit)
                </label>
                <input
                  type="number"
                  value={settings.baseExtensionDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    baseExtensionDuration: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Durasi setiap kali user memperpanjang peminjaman
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal Perpanjangan
                </label>
                <input
                  type="number"
                  value={settings.maxExtensions}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxExtensions: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Jumlah maksimal user bisa memperpanjang peminjaman
                </p>
              </div>
            </div>
          </div>

          {/* Fine Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pengaturan Denda</h2>
                <p className="text-sm text-gray-600">Atur denda untuk keterlambatan</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Denda (Rupiah)
              </label>
              <input
                type="number"
                value={settings.fineAmount}
                onChange={(e) => setSettings({
                  ...settings,
                  fineAmount: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Denda fixed yang dikenakan jika user terlambat mengembalikan sepeda
              </p>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <BikeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Jam Operasional</h2>
                <p className="text-sm text-gray-600">Atur jam buka dan tutup layanan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Buka
                </label>
                <input
                  type="time"
                  value={settings.operationalHours.open}
                  onChange={(e) => setSettings({
                    ...settings,
                    operationalHours: {
                      ...settings.operationalHours,
                      open: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Tutup
                </label>
                <input
                  type="time"
                  value={settings.operationalHours.close}
                  onChange={(e) => setSettings({
                    ...settings,
                    operationalHours: {
                      ...settings.operationalHours,
                      close: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              User tidak bisa melakukan peminjaman di luar jam operasional
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
