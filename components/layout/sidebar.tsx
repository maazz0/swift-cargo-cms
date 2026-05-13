'use client'

import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Package,
  LayoutDashboard,
  Search,
  Truck,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

  // Public navigation (always visible for everyone)
  const publicNav = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Tracking', href: '/tracking', icon: Search },
  ]

  // Protected navigation (only for authenticated users)
  const protectedNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: Package },
    { name: 'Couriers', href: '#', icon: Truck },
    { name: 'Customers', href: '#', icon: Users },
    { name: 'Settings', href: '#', icon: Settings },
  ]

  // Combine based on auth state
  const navigation = isAuthenticated ? [...publicNav, ...protectedNav] : publicNav

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300 dark:bg-slate-900 dark:border-slate-800',
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b dark:border-slate-800">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span
                className={cn(
                  'font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap transition-opacity',
                  isOpen ? 'opacity-100' : 'lg:opacity-0'
                )}
              >
                Swift Cargo
              </span>
            </Link>
            <button
              onClick={onToggle}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                    !isOpen && 'lg:justify-center'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-blue-600 dark:text-blue-400')} />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-opacity',
                      isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t p-3 dark:border-slate-800 space-y-2">
            {/* Auth Status Indicator */}
            <div className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl',
              isOpen ? '' : 'lg:justify-center'
            )}>
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                isAuthenticated ? 'bg-emerald-500' : 'bg-slate-400'
              )} />
              <span
                className={cn(
                  'text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap transition-opacity',
                  isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                )}
              >
                {isAuthenticated ? 'Logged In' : 'Guest'}
              </span>
            </div>

            {/* Logout Button - Only show when authenticated */}
            {isAuthenticated && (
              <button
                onClick={logout}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors',
                  !isOpen && 'lg:justify-center'
                )}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span
                  className={cn(
                    'whitespace-nowrap transition-opacity',
                    isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                  )}
                >
                  Sign Out
                </span>
              </button>
            )}

            {/* Login Link - Only show when NOT authenticated */}
            {!isAuthenticated && (
              <Link
                href="/login"
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-colors',
                  !isOpen && 'lg:justify-center'
                )}
              >
                <LogOut className="w-5 h-5 shrink-0 rotate-180" />
                <span
                  className={cn(
                    'whitespace-nowrap transition-opacity',
                    isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                  )}
                >
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}