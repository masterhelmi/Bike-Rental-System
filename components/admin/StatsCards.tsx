'use client'

import { Bike, Users, DollarSign, Clock, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  totalBikes: number
  availableBikes: number
  activeRentals: number
  queueLength: number
  todayRevenue: number
  todayPenalties: number
}

export function StatsCards({
  totalBikes,
  availableBikes,
  activeRentals,
  queueLength,
  todayRevenue,
  todayPenalties
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
      gradient: 'from-[#1E3A8A] to-[#2563EB]'
    },
    {
      title: 'Peminjaman Aktif',
      value: activeRentals,
      subtitle: 'Sedang berjalan',
      icon: Clock,
      gradient: 'from-[#059669] to-[#10B981]'
    },
    {
      title: 'Antrian',
      value: queueLength,
      subtitle: 'User menunggu',
      icon: Users,
      gradient: 'from-[#D97706] to-[#F59E0B]'
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(todayRevenue),
      subtitle: 'Total transaksi',
      icon: DollarSign,
      gradient: 'from-[#7C3AED] to-[#A855F7]'
    },
    {
      title: 'Denda Hari Ini',
      value: formatCurrency(todayPenalties),
      subtitle: 'Total denda keterlambatan',
      icon: AlertTriangle,
      gradient: 'from-[#DC2626] to-[#EF4444]'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="font-display text-3xl font-bold text-slate-900 mb-1">
            {stat.value}
          </h3>
          <p className="text-sm font-medium text-slate-600">
            {stat.title}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {stat.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}