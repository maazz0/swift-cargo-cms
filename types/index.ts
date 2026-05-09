export interface Customer {
  customer_id: string
  name: string
  phone_number: string | null
  email: string | null
  address: string | null
  customer_type: string | null
  created_at: string | null
}

export interface Branch {
  branch_id: string
  branch_name: string
  city: string
  phone_number: string | null
  manager_name: string | null
  is_active: boolean | null
}

export interface Courier {
  courier_id: string
  name: string
  phone_number: string | null
  vehicle_type: string | null
  employment_status: string | null
  branch_id: string | null
}

export interface Shipment {
  shipment_id: string
  tracking_number: string
  weight: number | null
  status: ShipmentStatus
  shipment_date: string
  customer_id: string | null
  origin_branch_id: string | null
  destination_branch_id: string | null
  created_at: string | null
  customers?: Customer | null
  deliveries?: Delivery | null
  payments?: Payment | null
  shipment_routes?: ShipmentRoute[]
}

export type ShipmentStatus = 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed'

export interface Delivery {
  delivery_id: string
  delivery_date: string | null
  delivery_status: string | null
  recipient_name: string | null
  shipment_id: string | null
  courier_id: string | null
  couriers?: Courier | null
}

export interface Payment {
  payment_id: string
  payment_date: string | null
  amount: number | null
  payment_method: string | null
  payment_status: string | null
  shipment_id: string | null
}

export interface Route {
  route_id: string
  route_name: string
  origin_branch_id: string | null
  destination_branch_id: string | null
  estimated_duration_minutes: number | null
  is_active: boolean | null
}

export interface ShipmentRoute {
  shipment_route_id: string
  shipment_id: string | null
  route_id: string | null
  assigned_date: string | null
  status: string | null
  estimated_time: string | null
  notes: string | null
  routes?: Route | null
}

export interface DashboardStats {
  totalShipments: number
  pendingShipments: number
  deliveredShipments: number
  inTransitShipments: number
  totalRevenue: number
  activeCouriers: number
  totalCustomers: number
}

export interface ActivityItem {
  id: string
  type: 'shipment_created' | 'shipment_delivered' | 'payment_received' | 'status_updated'
  description: string
  timestamp: string
  metadata?: Record<string, string>
}