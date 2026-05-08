'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Shipment {
  shipment_id: string
  tracking_number: string
  weight: number
  status: string
  shipment_date: string
  customers: { name: string }
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShipments()
  }, [])

  async function fetchShipments() {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        customers (name)
      `)
      .order('shipment_date', { ascending: false })

    if (data) setShipments(data)
    setLoading(false)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Shipment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tracking #</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Weight (kg)</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shipments.map((s) => (
              <tr key={s.shipment_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{s.tracking_number}</td>
                <td className="px-6 py-4 text-sm">{s.customers?.name}</td>
                <td className="px-6 py-4 text-sm">{s.weight}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(s.shipment_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  )
}