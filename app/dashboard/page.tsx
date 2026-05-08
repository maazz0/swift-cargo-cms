'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Truck, Users, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeCouriers: 0,
    totalCustomers: 0,
    revenue: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { count: shipments } = await supabase
      .from('shipments').select('*', { count: 'exact', head: true })
    
    const { count: couriers } = await supabase
      .from('couriers').select('*', { count: 'exact', head: true })
      .eq('employment_status', 'Active')
    
    const { count: customers } = await supabase
      .from('customers').select('*', { count: 'exact', head: true })
    
    const { data: payments } = await supabase
      .from('payments').select('amount')
      .eq('payment_status', 'Completed')

    const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    setStats({
      totalShipments: shipments || 0,
      activeCouriers: couriers || 0,
      totalCustomers: customers || 0,
      revenue
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Swift Cargo Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Total Shipments" value={stats.totalShipments} color="blue" />
        <StatCard icon={Truck} label="Active Couriers" value={stats.activeCouriers} color="green" />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} color="purple" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} color="orange" />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className={`p-6 rounded-xl ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8" />
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}