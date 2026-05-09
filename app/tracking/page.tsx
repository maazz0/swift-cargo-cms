'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { StatusBadge } from '@/components/ui/status-badge'
import { ShipmentTimeline } from '@/components/ui/shipment-timeline'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/lib/supabase'
import { formatDateTime, formatCurrency, getStatusIconColor } from '@/lib/utils'
import type { Shipment } from '@/types'
import {
  Search,
  Package,
  MapPin,
  User,
  Phone,
  Weight,
  DollarSign,
  Calendar,
  Truck,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'

interface TimelineEvent {
  id: string
  status: string
  title: string
  description: string
  timestamp: string
  isCompleted: boolean
  isCurrent: boolean
}

export default function TrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('tracking-history')
    if (saved) setSearchHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!trackingNumber || !shipment) return

    const channel = supabase
      .channel(`shipment_${trackingNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `tracking_number=eq.${trackingNumber}`,
        },
        (payload) => {
          setShipment((prev) => (prev ? { ...prev, ...payload.new } : null))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trackingNumber, shipment])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setLoading(true)
    setError('')
    setShipment(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('shipments')
        .select(
          `
          *,
          customers (name, phone_number, address, email),
          deliveries (
            delivery_status,
            delivery_date,
            recipient_name,
            couriers (name, phone_number, vehicle_type)
          ),
          payments (amount, payment_status, payment_method),
          shipment_routes (
            assigned_date,
            status,
            estimated_time,
            notes,
            routes (route_name, origin_branch_id, destination_branch_id)
          )
        `
        )
        .eq('tracking_number', trackingNumber.trim())
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('No shipment found with that tracking number. Please check and try again.')
        } else {
          setError(`Database error: ${fetchError.message}`)
        }
        return
      }

      if (!data) {
        setError('Shipment not found.')
        return
      }

      setShipment(data)

      // Save to history
      const newHistory = [trackingNumber.trim(), ...searchHistory.filter((h) => h !== trackingNumber.trim())].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('tracking-history', JSON.stringify(newHistory))
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function getTimelineEvents(shipmentData: Shipment): TimelineEvent[] {
    const events: TimelineEvent[] = [
      {
        id: 'created',
        status: 'Pending',
        title: 'Shipment Created',
        description: `Package registered by ${shipmentData.customers?.name || 'sender'}`,
        timestamp: formatDateTime(shipmentData.shipment_date),
        isCompleted: true,
        isCurrent: shipmentData.status === 'Pending',
      },
    ]

    const routeEvents = (shipmentData.shipment_routes || []).map((route, index) => ({
      id: `route-${index}`,
      status: route.status || 'Scheduled',
      title: route.routes?.route_name || `Route ${index + 1}`,
      description: route.notes || `Moving through ${route.routes?.route_name || 'route'}`,
      timestamp: route.assigned_date ? formatDateTime(route.assigned_date) : 'Scheduled',
      isCompleted: route.status === 'Completed',
      isCurrent: route.status === 'In Progress',
    }))

    events.push(...routeEvents)

    if (shipmentData.status === 'Delivered') {
      events.push({
        id: 'delivered',
        status: 'Delivered',
        title: 'Delivered',
        description: `Package delivered to ${shipmentData.deliveries?.recipient_name || 'recipient'}`,
        timestamp: shipmentData.deliveries?.delivery_date
          ? formatDateTime(shipmentData.deliveries.delivery_date)
          : formatDateTime(new Date().toISOString()),
        isCompleted: true,
        isCurrent: false,
      })
    } else if (shipmentData.status === 'Failed') {
      events.push({
        id: 'failed',
        status: 'Failed',
        title: 'Delivery Failed',
        description: 'Delivery attempt unsuccessful',
        timestamp: formatDateTime(new Date().toISOString()),
        isCompleted: false,
        isCurrent: true,
      })
    }

    return events
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-20 xl:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="p-6 sm:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Track Shipment</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Enter a tracking number to view shipment details
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g., SWFT-123456)"
                    className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !trackingNumber.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Track'}
                </button>
              </div>
            </form>

            {searchHistory.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">Recent:</span>
                {searchHistory.map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setTrackingNumber(num)
                    }}
                    className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {shipment && (
            <div className="space-y-6 animate-fade-in">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Live tracking active — updates in real-time
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Card */}
                  <div className="rounded-2xl bg-white border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm mb-1">Tracking Number</p>
                          <p className="text-3xl font-mono font-bold">{shipment.tracking_number}</p>
                        </div>
                        <StatusBadge status={shipment.status} light />
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <InfoItem icon={Weight} label="Weight" value={shipment.weight ? `${shipment.weight} kg` : 'N/A'} />
                      <InfoItem
                        icon={DollarSign}
                        label="Amount"
                        value={shipment.payments?.amount ? formatCurrency(shipment.payments.amount) : 'N/A'}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Shipped"
                        value={formatDate(shipment.shipment_date)}
                      />
                      <InfoItem
                        icon={Package}
                        label="Payment"
                        value={shipment.payments?.payment_status || 'Pending'}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="rounded-2xl bg-white border shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                      Shipment Progress
                    </h3>
                    <ShipmentTimeline events={getTimelineEvents(shipment)} />
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  {/* Sender */}
                  <InfoCard
                    title="Sender Information"
                    icon={User}
                    items={[
                      { label: 'Name', value: shipment.customers?.name || 'N/A' },
                      { label: 'Phone', value: shipment.customers?.phone_number || 'N/A' },
                      { label: 'Email', value: shipment.customers?.email || 'N/A' },
                      { label: 'Address', value: shipment.customers?.address || 'N/A' },
                    ]}
                  />

                  {/* Recipient */}
                  <InfoCard
                    title="Recipient Information"
                    icon={MapPin}
                    items={[
                      { label: 'Name', value: shipment.deliveries?.recipient_name || 'Pending' },
                      {
                        label: 'Courier',
                        value: shipment.deliveries?.couriers?.name || 'Not assigned',
                      },
                      {
                        label: 'Courier Phone',
                        value: shipment.deliveries?.couriers?.phone_number || 'N/A',
                      },
                      {
                        label: 'Vehicle',
                        value: shipment.deliveries?.couriers?.vehicle_type || 'N/A',
                      },
                    ]}
                  />

                  {/* Route Info */}
                  {shipment.shipment_routes && shipment.shipment_routes.length > 0 && (
                    <div className="rounded-2xl bg-white border shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                        Route Details
                      </h3>
                      <div className="space-y-3">
                        {shipment.shipment_routes.map((route, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                          >
                            <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {route.routes?.route_name || 'Route'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {route.status} • {formatDate(route.assigned_date)}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  )
}

function InfoCard({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ElementType
  items: { label: string; value: string | null }[]
}) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}