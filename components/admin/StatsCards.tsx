'use client'

import { Bike, Users, DollarSign, Clock } from 'lucide-react'

interface StatsCardsProps {
  totalBikes: number
  availableBikes: number
  activeRentals: number
  queueLength: number
  todayRevenue: number
}

export function StatsCards({
  totalBikes,
  availableBikes,
  activeRentals,
  queueLength,
  todayRevenue
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const stats = [
    {
      title: 'Total Sepeda',
      value: totalBikes,
      subtitle: `${availableBikes} tersedia`,
      icon: Bike,
      color: 'bg-blue-500'
    },
    {
      title: 'Peminjaman Aktif',
      value: activeRentals,
      subtitle: 'Sedang berjalan',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Antrian',
      value: queueLength,
      subtitle: 'User menunggu',
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(todayRevenue),
      subtitle: 'Total transaksi',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </h3>
          <p className="text-sm text-gray-600">
            {stat.title}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stat.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}