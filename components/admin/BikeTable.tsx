'use client'

import { BikeWithType } from '@/lib/types/database'
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react'

interface BikeTableProps {
  bikes: BikeWithType[]
  onEdit?: (bike: BikeWithType) => void
  onDelete?: (bikeId: string) => void
  onAdd?: () => void
  onResetStatus?: (bikeId: string) => void
}

export function BikeTable({ bikes, onEdit, onDelete, onAdd, onResetStatus }: BikeTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'rented':
        return 'bg-[#DBEAFE] text-[#1E3A8A]'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia'
      case 'rented':
        return 'Dipinjam'
      case 'maintenance':
        return 'Perbaikan'
      case 'unavailable':
        return 'Tidak Tersedia'
      default:
        return status
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      <div className="p-6 border-b border-slate-200/60 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Daftar Sepeda</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola inventaris sepeda Anda</p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-5 py-2.5 rounded-xl hover:from-[#1E40AF] hover:to-[#3B82F6] transition-all text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Tambah Sepeda
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Terakhir Perbaikan
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {bikes.map((bike) => (
              <tr key={bike.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">
                    {bike.bike_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {bike.bike_type?.name || '-'}
                  </div>
                  {bike.bike_type && (
                    <div className="text-xs text-slate-500">
                      Rp {bike.bike_type.hourly_rate.toLocaleString('id-ID')}/jam
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(bike.status)}`}>
                    {getStatusText(bike.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {bike.current_location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {bike.last_maintenance
                    ? new Date(bike.last_maintenance).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(bike)}
                        className="w-9 h-9 flex items-center justify-center text-[#1E3A8A] hover:text-[#1E40AF] hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onResetStatus && bike.status === 'rented' && (
                      <button
                        onClick={() => onResetStatus(bike.id)}
                        className="w-9 h-9 flex items-center justify-center text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-all"
                        title="Reset Status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && bike.status !== 'rented' && (
                      <button
                        onClick={() => onDelete(bike.id)}
                        className="w-9 h-9 flex items-center justify-center text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bikes.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Belum ada sepeda yang terdaftar</p>
        </div>
      )}
    </div>
  )
}