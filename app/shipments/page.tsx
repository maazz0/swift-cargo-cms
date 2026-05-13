'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { StatusBadge } from '@/components/ui/status-badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Shipment, ShipmentStatus } from '@/types'
import { useAuth } from '@/components/auth-provider'
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  
} from 'lucide-react'

type SortField = 'tracking_number' | 'status' | 'shipment_date' | 'weight'
type SortOrder = 'asc' | 'desc'

export default function ShipmentsPage() {

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    )
  }

  // ... rest of shipments code
  
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data states
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState<SortField>('shipment_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Selection
  const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set())

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('shipments')
        .select(
          '*, customers(name, phone_number), deliveries(recipient_name, couriers(name)), payments(amount, payment_status)',
          { count: 'exact' }
        )

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply search
      if (searchQuery.trim()) {
        query = query.or(`tracking_number.ilike.%${searchQuery}%,customers.name.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setShipments(data || [])
      setTotalCount(count || 0)
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter, sortField, sortOrder])

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  function toggleSelection(shipmentId: string) {
    const newSelected = new Set(selectedShipments)
    if (newSelected.has(shipmentId)) {
      newSelected.delete(shipmentId)
    } else {
      newSelected.add(shipmentId)
    }
    setSelectedShipments(newSelected)
  }

  function toggleAll() {
    if (selectedShipments.size === shipments.length) {
      setSelectedShipments(new Set())
    } else {
      setSelectedShipments(new Set(shipments.map((s) => s.shipment_id)))
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const statusOptions: { value: ShipmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Out for Delivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Failed', label: 'Failed' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-20 xl:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="p-6 sm:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shipments</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage and track all your shipments
              </p>
            </div>
              
              <Link
                href="/shipments/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                New Shipment
              </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
              <button onClick={fetchShipments} className="ml-auto text-sm font-medium underline">
                Retry
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tracking number or customer name..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  showFilters
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {statusFilter !== 'all' && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    1
                  </span>
                )}
              </button>

              {/* Export */}
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Filter</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        statusFilter === option.value
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{shipments.length}</span> of{' '}
              <span className="font-medium text-slate-900 dark:text-white">{totalCount}</span> shipments
              {selectedShipments.size > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">({selectedShipments.size} selected)</span>
              )}
            </p>
          </div>

          {/* Table */}
          <div className="rounded-2xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50/80 dark:bg-slate-800/80 dark:border-slate-800">
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={shipments.length > 0 && selectedShipments.size === shipments.length}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort('tracking_number')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        Tracking #
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Customer
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        Status
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort('weight')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        Weight
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Payment
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort('shipment_date')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        Date
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <LoadingSpinner size="md" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">Loading shipments...</p>
                        </div>
                      </td>
                    </tr>
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Package className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No shipments found</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Create your first shipment to get started'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => (
                      <tr
                        key={shipment.shipment_id}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedShipments.has(shipment.shipment_id)}
                            onChange={() => toggleSelection(shipment.shipment_id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                              {shipment.tracking_number}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {shipment.deliveries?.recipient_name || 'No recipient'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-950/30 dark:text-blue-300">
                              {shipment.customers?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {shipment.customers?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {shipment.customers?.phone_number || 'No phone'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={shipment.status} size="sm" />
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {shipment.weight ? `${shipment.weight} kg` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {shipment.payments?.amount ? formatCurrency(shipment.payments.amount) : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {shipment.payments?.payment_status || 'Pending'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(shipment.shipment_date)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(`/tracking?number=${shipment.tracking_number}`)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors dark:hover:bg-blue-950/30"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                                <Link
                                href="/shipments/new"
                                className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors dark:hover:bg-amber-950/30"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to delete shipment ${shipment.tracking_number}?`)) return
                                  
                                  try {
                                    // Delete related records first (due to FK constraints)
                                    await supabase.from('payments').delete().eq('shipment_id', shipment.shipment_id)
                                    await supabase.from('deliveries').delete().eq('shipment_id', shipment.shipment_id)
                                    await supabase.from('shipment_routes').delete().eq('shipment_id', shipment.shipment_id)
                                    
                                    // Delete the shipment
                                    const { error } = await supabase.from('shipments').delete().eq('shipment_id', shipment.shipment_id)
                                    
                                    if (error) throw error
                                    
                                    // Remove from local state - use the correct state setter from YOUR shipments page
                                    setShipments(prev => prev.filter(s => s.shipment_id !== shipment.shipment_id))
                                    setTotalCount(prev => prev - 1)
                                    
                                    // Clear selection if this was selected
                                    setSelectedShipments(prev => {
                                      const newSet = new Set(prev)
                                      newSet.delete(shipment.shipment_id)
                                      return newSet
                                    })
                                    
                                    alert('Shipment deleted successfully')
                                  } catch (err: any) {
                                    alert('Failed to delete: ' + err.message)
                                  }
                                }}
                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-950/30"
                                title="Delete"
                              >
                              <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and neighbors
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center gap-1">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-slate-400 dark:text-slate-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}