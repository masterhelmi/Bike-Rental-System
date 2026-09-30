'use client'

import { BikeWithType } from '@/lib/types/database'
import { Edit, Trash2, Plus } from 'lucide-react'

interface BikeTableProps {
  bikes: BikeWithType[]
  onEdit?: (bike: BikeWithType) => void
  onDelete?: (bikeId: string) => void
  onAdd?: () => void
}

export function BikeTable({ bikes, onEdit, onDelete, onAdd }: BikeTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'rented':
        return 'bg-blue-100 text-blue-800'
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Daftar Sepeda</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Sepeda
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terakhir Perbaikan
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bikes.map((bike) => (
              <tr key={bike.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bike.bike_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {bike.bike_type?.name || '-'}
                  </div>
                  {bike.bike_type && (
                    <div className="text-xs text-gray-500">
                      Rp {bike.bike_type.hourly_rate.toLocaleString('id-ID')}/jam
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bike.status)}`}>
                    {getStatusText(bike.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bike.current_location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bike.last_maintenance
                    ? new Date(bike.last_maintenance).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(bike)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && bike.status !== 'rented' && (
                      <button
                        onClick={() => onDelete(bike.id)}
                        className="text-red-600 hover:text-red-900"
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
        <div className="p-8 text-center text-gray-500">
          Belum ada sepeda yang terdaftar
        </div>
      )}
    </div>
  )
}