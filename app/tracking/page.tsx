'use client'

import { useState, useEffect } from 'react'  // ← Add useEffect here
import { supabase } from '@/lib/supabase'
import { Search, Truck, CheckCircle, Clock, Package } from 'lucide-react'

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ============================================
  // REALTIME FEATURE - ADD THIS useEffect HERE
  // ============================================
  useEffect(() => {
    // Only subscribe if we have a tracking number and shipment data
    if (!trackingNumber || !shipment) return

    const channel = supabase
      .channel(`shipment_${trackingNumber}`)  // Unique channel per tracking number
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `tracking_number=eq.${trackingNumber}`
        },
        (payload) => {
          // Update shipment state with new data
          setShipment((prev: any) => ({ ...prev, ...payload.new }))
          
          // Optional: Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('Shipment Update', {
              body: `Status updated to: ${payload.new.status}`,
              icon: '/logo.png'
            })
          }
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts or tracking number changes
    return () => {
      supabase.removeChannel(channel)
    }
  }, [trackingNumber, shipment])  // Re-run when trackingNumber or shipment changes
  // ============================================

  async function trackShipment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShipment(null)

    const { data, error: fetchError } = await supabase
      .from('shipments')
      .select(`
        *,
        customers (name, phone_number, address),
        deliveries (
          delivery_status,
          delivery_date,
          recipient_name,
          couriers (name, phone_number)
        ),
        payments (amount, payment_status, payment_method),
        shipment_routes (
          assigned_date,
          status,
          estimated_time,
          notes,
          routes (route_name, origin_branch_id, destination_branch_id)
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single()

    if (fetchError || !data) {
      setError('Shipment not found. Please check your tracking number.')
    } else {
      setShipment(data)
      // Request notification permission on first successful track
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Swift Cargo Tracking
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to get real-time updates
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={trackShipment} className="flex gap-2 mb-8">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g., SWFT-123456)"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {/* Live Indicator */}
        {shipment && (
          <div className="flex items-center gap-2 mb-4 text-sm text-green-600">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live updates enabled — stay on this page for real-time status changes
          </div>
        )}

        {/* Shipment Details */}
        {shipment && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Status Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Tracking Number</p>
                  <p className="text-2xl font-mono font-bold">{shipment.tracking_number}</p>
                </div>
                <StatusBadge status={shipment.status} light />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender & Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">From (Sender)</p>
                  <p className="font-semibold text-gray-900">{shipment.customers?.name}</p>
                  <p className="text-sm text-gray-600">{shipment.customers?.phone_number}</p>
                  <p className="text-sm text-gray-600">{shipment.customers?.address}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">To (Recipient)</p>
                  <p className="font-semibold text-gray-900">{shipment.deliveries?.recipient_name || 'Pending assignment'}</p>
                  {shipment.deliveries?.couriers && (
                    <p className="text-sm text-gray-600">
                      Courier: {shipment.deliveries.couriers.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Parcel Details */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Parcel Information</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{shipment.weight} kg</p>
                    <p className="text-xs text-gray-500 mt-1">Weight</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{shipment.payments?.amount ? `$${shipment.payments.amount}` : 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">Amount</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{shipment.payments?.payment_status || 'Pending'}</p>
                    <p className="text-xs text-gray-500 mt-1">Payment</p>
                  </div>
                </div>
              </div>

              {/* Route Progress */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Route Progress</p>
                <div className="space-y-3">
                  {shipment.shipment_routes?.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No route information available yet.</p>
                  )}
                  {shipment.shipment_routes?.map((route: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        route.status === 'Completed' ? 'bg-green-50 border-green-200' :
                        route.status === 'In Progress' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {route.status === 'Completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : route.status === 'In Progress' ? (
                        <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 animate-pulse" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{route.routes?.route_name}</p>
                        <p className="text-sm text-gray-500">
                          {route.status} • {new Date(route.assigned_date).toLocaleDateString()}
                          {route.estimated_time && ` • Est. ${new Date(route.estimated_time).toLocaleTimeString()}`}
                        </p>
                        {route.notes && (
                          <p className="text-xs text-gray-400 mt-1">{route.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipment Date */}
              <div className="border-t pt-4 text-center text-sm text-gray-500">
                Shipped on {new Date(shipment.shipment_date).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Updated Status Badge with optional light mode for dark backgrounds
function StatusBadge({ status, light = false }: { status: string; light?: boolean }) {
  const colors: Record<string, string> = {
    'Pending': light ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-100 text-yellow-800',
    'In Transit': light ? 'bg-blue-400 text-blue-900' : 'bg-blue-100 text-blue-800',
    'Out for Delivery': light ? 'bg-purple-400 text-purple-900' : 'bg-purple-100 text-purple-800',
    'Delivered': light ? 'bg-green-400 text-green-900' : 'bg-green-100 text-green-800',
    'Failed': light ? 'bg-red-400 text-red-900' : 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  )
}