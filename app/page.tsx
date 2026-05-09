import Link from 'next/link'
import { ArrowRight, Package, Truck, Shield, BarChart3, Clock, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Swift Cargo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/tracking"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Track Shipment
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Now serving 500+ cities worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 animate-slide-up">
            Ship Smarter.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Deliver Faster.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 mb-10 animate-slide-up">
            The modern courier management system designed for logistics companies that demand speed,
            reliability, and real-time visibility.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/tracking"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Track Your Shipment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4 max-w-3xl mx-auto">
            {[
              { label: 'Deliveries', value: '2M+' },
              { label: 'Cities', value: '500+' },
              { label: 'Couriers', value: '10K+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to manage logistics
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed for modern courier operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: 'Real-time Tracking',
                description: 'Track every shipment in real-time with live updates and GPS integration.',
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Comprehensive dashboards and reports to optimize your delivery operations.',
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with end-to-end encryption for all shipments.',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
              },
              {
                icon: Clock,
                title: 'Fast Delivery',
                description: 'Optimized routes and smart scheduling for fastest delivery times.',
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
              },
              {
                icon: Globe,
                title: 'Global Coverage',
                description: 'Ship to over 500 cities with our extensive courier network.',
                color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
              },
              {
                icon: Package,
                title: 'Smart Management',
                description: 'Automated workflows for shipment sorting, routing, and delivery.',
                color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
              >
                <div className={`inline-flex rounded-xl p-3 mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your logistics?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of companies already using Swift Cargo to power their delivery operations.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Swift Cargo</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Swift Cargo CMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}