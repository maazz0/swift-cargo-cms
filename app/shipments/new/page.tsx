'use client'

import { useAuth } from '@/components/auth-provider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { StatusBadge } from '@/components/ui/status-badge'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Package,
  Plus,
  User,
  MapPin,
  Weight,
  DollarSign,
  Truck,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'

interface Customer {
  customer_id: string
  name: string
  phone_number: string | null
  email: string | null
  address: string | null
  customer_type: string | null
}

interface Branch {
  branch_id: string
  branch_name: string
  city: string
}

interface Courier {
  courier_id: string
  name: string
  vehicle_type: string | null
}

export default function NewShipmentPage() {

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

  // ... rest of new shipment form code 
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dropdown data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form states
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Customer selection
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  
  // New customer fields
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone_number: '',
    email: '',
    address: '',
    customer_type: 'Individual',
  })

  // Shipment fields
  const [trackingNumber, setTrackingNumber] = useState('')
  const [weight, setWeight] = useState('')
  const [originBranch, setOriginBranch] = useState('')
  const [destinationBranch, setDestinationBranch] = useState('')

  // Delivery fields
  const [recipientName, setRecipientName] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('')

  // Payment fields
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  useEffect(() => {
    fetchDropdownData()
    generateTrackingNumber()
  }, [])

  async function fetchDropdownData() {
    try {
      const [
        { data: customersData },
        { data: branchesData },
        { data: couriersData },
      ] = await Promise.all([
        supabase.from('customers').select('customer_id, name, phone_number, email, address, customer_type').order('name'),
        supabase.from('branches').select('branch_id, branch_name, city').eq('is_active', true).order('branch_name'),
        supabase.from('couriers').select('courier_id, name, vehicle_type').eq('employment_status', 'Active').order('name'),
      ])

      setCustomers(customersData || [])
      setBranches(branchesData || [])
      setCouriers(couriersData || [])
    } catch (err) {
      console.error('Failed to load dropdown data', err)
    } finally {
      setLoadingData(false)
    }
  }

  function generateTrackingNumber() {
    const random = Math.floor(100000 + Math.random() * 900000)
    setTrackingNumber(`SWFT-${random}`)
  }

  function validateStep(currentStep: number): boolean {
    setError('')
    
    if (currentStep === 1) {
      if (customerMode === 'existing' && !selectedCustomer) {
        setError('Please select a customer')
        return false
      }
      if (customerMode === 'new') {
        if (!newCustomer.name.trim()) {
          setError('Customer name is required')
          return false
        }
        if (!newCustomer.phone_number.trim()) {
          setError('Customer phone number is required')
          return false
        }
      }
    }

    if (currentStep === 2) {
      if (!trackingNumber.trim()) {
        setError('Tracking number is required')
        return false
      }
      if (!weight || parseFloat(weight) <= 0) {
        setError('Please enter a valid weight')
        return false
      }
      if (!originBranch) {
        setError('Please select origin branch')
        return false
      }
      if (!destinationBranch) {
        setError('Please select destination branch')
        return false
      }
      if (originBranch === destinationBranch) {
        setError('Origin and destination branches must be different')
        return false
      }
    }

    if (currentStep === 3) {
      if (!recipientName.trim()) {
        setError('Recipient name is required')
        return false
      }
    }

    if (currentStep === 4) {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid payment amount')
        return false
      }
    }

    return true
  }

  async function handleSubmit() {
    if (!validateStep(4)) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      let customerId = selectedCustomer

      // Step 1: Create new customer if needed
      if (customerMode === 'new') {
        const { data: newCust, error: custError } = await supabase
          .from('customers')
          .insert({
            name: newCustomer.name,
            phone_number: newCustomer.phone_number,
            email: newCustomer.email || null,
            address: newCustomer.address || null,
            customer_type: newCustomer.customer_type,
          })
          .select()
          .single()

        if (custError) throw new Error(`Customer creation failed: ${custError.message}`)
        customerId = newCust.customer_id
      }

      // Step 2: Create shipment
      const { data: shipment, error: shipError } = await supabase
        .from('shipments')
        .insert({
          tracking_number: trackingNumber.trim().toUpperCase(),
          weight: parseFloat(weight),
          status: 'Pending',
          shipment_date: new Date().toISOString(),
          customer_id: customerId,
          origin_branch_id: originBranch,
          destination_branch_id: destinationBranch,
        })
        .select()
        .single()

      if (shipError) throw new Error(`Shipment creation failed: ${shipError.message}`)

      // Step 3: Create delivery
      const { error: delError } = await supabase
        .from('deliveries')
        .insert({
          delivery_status: 'Pending',
          recipient_name: recipientName.trim(),
          shipment_id: shipment.shipment_id,
          courier_id: selectedCourier || null,
        })

      if (delError) throw new Error(`Delivery creation failed: ${delError.message}`)

      // Step 4: Create payment
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          payment_date: new Date().toISOString(),
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          payment_status: 'Pending',
          shipment_id: shipment.shipment_id,
        })

      if (payError) throw new Error(`Payment creation failed: ${payError.message}`)

      setSuccess(`Shipment ${trackingNumber} created successfully!`)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/shipments')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to create shipment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 dark:text-slate-400">Loading form data...</p>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Customer', icon: User },
    { number: 2, title: 'Shipment', icon: Package },
    { number: 3, title: 'Delivery', icon: Truck },
    { number: 4, title: 'Payment', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-20 xl:ml-64 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="p-6 sm:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/shipments"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shipments
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Shipment</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Fill in the details to register a new shipment
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => {
                      if (s.number < step || success) {
                        setStep(s.number)
                        setError('')
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 group',
                      s.number <= step ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                        s.number === step
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : s.number < step
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                      )}
                    >
                      {s.number < step ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <s.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          s.number === step
                            ? 'text-blue-600 dark:text-blue-400'
                            : s.number < step
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500'
                        )}
                      >
                        {s.title}
                      </p>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'mx-4 h-0.5 flex-1 rounded-full transition-all',
                        s.number < step
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white border shadow-sm dark:bg-slate-900 dark:border-slate-800">
            {/* Step 1: Customer */}
            {step === 1 && (
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h2>

                <div className="flex gap-4 p-1 bg-slate-100 rounded-xl dark:bg-slate-800">
                  <button
                    onClick={() => setCustomerMode('existing')}
                    className={cn(
                      'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                      customerMode === 'existing'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    )}
                  >
                    Existing Customer
                  </button>
                  <button
                    onClick={() => setCustomerMode('new')}
                    className={cn(
                      'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                      customerMode === 'new'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    )}
                  >
                    New Customer
                  </button>
                </div>

                {customerMode === 'existing' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select Customer
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">Choose a customer...</option>
                        {customers.map((c) => (
                          <option key={c.customer_id} value={c.customer_id}>
                            {c.name} {c.phone_number ? `(${c.phone_number})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {selectedCustomer && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        {(() => {
                          const c = customers.find((x) => x.customer_id === selectedCustomer)
                          return c ? (
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                              <p className="text-slate-500 dark:text-slate-400">{c.phone_number}</p>
                              <p className="text-slate-500 dark:text-slate-400">{c.email}</p>
                              <p className="text-slate-500 dark:text-slate-400">{c.address}</p>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          value={newCustomer.phone_number}
                          onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
                          placeholder="+1-555-0100"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          placeholder="john@email.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                          placeholder="123 Main St, City, State"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Customer Type
                      </label>
                      <div className="flex gap-4">
                        {['Individual', 'Business'].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="customer_type"
                              value={type}
                              checked={newCustomer.customer_type === type}
                              onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (validateStep(1)) setStep(2)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipment Details */}
            {step === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Shipment Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tracking Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={generateTrackingNumber}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        Regenerate
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Auto-generated. You can edit it.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="2.5"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Origin Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={originBranch}
                        onChange={(e) => setOriginBranch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">Select origin...</option>
                        {branches.map((b) => (
                          <option key={b.branch_id} value={b.branch_id}>
                            {b.branch_name} — {b.city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Destination Branch <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={destinationBranch}
                        onChange={(e) => setDestinationBranch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">Select destination...</option>
                        {branches.map((b) => (
                          <option key={b.branch_id} value={b.branch_id}>
                            {b.branch_name} — {b.city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep(2)) setStep(3)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Delivery */}
            {step === 3 && (
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Delivery Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Assigned Courier (Optional)
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={selectedCourier}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        <option value="">Auto-assign later...</option>
                        {couriers.map((c) => (
                          <option key={c.courier_id} value={c.courier_id}>
                            {c.name} {c.vehicle_type ? `(${c.vehicle_type})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep(3)) setStep(4)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Payment Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="45.00"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Payment Method
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-slate-50 p-4 space-y-2 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Tracking:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">{trackingNumber}</span>
                    <span className="text-slate-500 dark:text-slate-400">Weight:</span>
                    <span className="text-slate-900 dark:text-white">{weight} kg</span>
                    <span className="text-slate-500 dark:text-slate-400">Recipient:</span>
                    <span className="text-slate-900 dark:text-white">{recipientName}</span>
                    <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                    <span className="text-slate-900 dark:text-white">${amount}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Shipment
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}