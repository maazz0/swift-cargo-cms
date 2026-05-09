'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { ChartBar } from '@/components/ui/chart-bar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { DashboardStats, Shipment } from '@/types'
import {
  Package,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    pendingShipments: 0,
    deliveredShipments: 0,
    inTransitShipments: 0,
    totalRevenue: 0,
    activeCouriers: 0,
    totalCustomers: 0,
  })
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // Fetch counts in parallel
      const [
        { count: totalShipments },
        { count: pendingShipments },
        { count: deliveredShipments },
        { count: inTransitShipments },
        { count: activeCouriers },
        { count: totalCustomers },
        { data: payments },
        { data: shipments },
      ] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true }),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'Delivered'),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'In Transit'),
        supabase.from('couriers').select('*', { count: 'exact', head: true }).eq('employment_status', 'Active'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('payment_status', 'Completed'),
        supabase
          .from('shipments')
          .select('*, customers(name), deliveries(recipient_name, couriers(name))')
          .order('shipment_date', { ascending: false })
          .limit(5),
      ])

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setStats({
        totalShipments: totalShipments || 0,
        pendingShipments: pendingShipments || 0,
        deliveredShipments: deliveredShipments || 0,
        inTransitShipments: inTransitShipments || 0,
        totalRevenue,
        activeCouriers: activeCouriers || 0,
        totalCustomers: totalCustomers || 0,
      })

      setRecentShipments(shipments || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const deliveryPerformance = [
    { label: 'On Time', value: stats.deliveredShipments, color: 'bg-emerald-500' },
    { label: 'In Transit', value: stats.inTransitShipments, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pendingShipments, color: 'bg-amber-500' },
  ]

  const maxPerformance = Math.max(...deliveryPerformance.map((d) => d.value), 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-20 xl:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="p-6 sm:p-8 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="ml-auto text-sm font-medium underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Overview of your logistics operations
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Shipments"
              value={stats.totalShipments}
              subtitle="All time shipments"
              icon={Package}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="In Transit"
              value={stats.inTransitShipments}
              subtitle="Currently moving"
              icon={Truck}
              color="purple"
            />
            <StatCard
              title="Delivered"
              value={stats.deliveredShipments}
              subtitle="Successfully completed"
              icon={CheckCircle2}
              color="emerald"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle="Total earnings"
              icon={DollarSign}
              color="amber"
              trend={{ value: 24, isPositive: true }}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl bg-white p-6 border shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active Couriers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeCouriers}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  +5%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-3/4 rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 border shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingShipments}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                  <ArrowUpRight className="w-3 h-3" />
                  +2%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${stats.totalShipments ? (stats.pendingShipments / stats.totalShipments) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 border shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* Charts & Recent Shipments */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Delivery Performance */}
            <div className="xl:col-span-1 rounded-2xl bg-white p-6 border shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Delivery Performance
              </h3>
              <ChartBar data={deliveryPerformance} maxValue={maxPerformance} />
              <div className="mt-6 pt-6 border-t dark:border-slate-800 space-y-3">
                {deliveryPerformance.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Shipments */}
            <div className="xl:col-span-2 rounded-2xl bg-white border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Shipments</h3>
                <button
                  onClick={() => router.push('/shipments')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tracking #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentShipments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                          No shipments found
                        </td>
                      </tr>
                    ) : (
                      recentShipments.map((shipment) => (
                        <tr
                          key={shipment.shipment_id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                              {shipment.tracking_number}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {shipment.customers?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {shipment.deliveries?.recipient_name || 'No recipient'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {shipment.weight ? `${shipment.weight} kg` : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={shipment.status} size="sm" />
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(shipment.shipment_date)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}