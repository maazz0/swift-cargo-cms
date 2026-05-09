'use client'

import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Bell, Moon, Sun, Menu, X, Package, Search } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface NavbarProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export function Navbar({ onMenuClick, isSidebarOpen }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: '1', title: 'New shipment created', time: '2 min ago', unread: true },
    { id: '2', title: 'Package delivered #SWFT-8842', time: '1 hr ago', unread: true },
    { id: '3', title: 'Payment received $120.00', time: '3 hr ago', unread: false },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Swift Cargo</span>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shipments, tracking numbers..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-lg dark:bg-slate-900 dark:border-slate-800 z-20">
                  <div className="p-4 border-b dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b last:border-b-0 dark:border-slate-800',
                          n.unread && 'bg-blue-50/50 dark:bg-blue-950/20'
                        )}
                      >
                        <div className={cn('mt-1 h-2 w-2 rounded-full shrink-0', n.unread ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600')} />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2 border-l dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manager</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
              {getInitials('Admin User')}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}