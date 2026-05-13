import React from 'react'

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }
  return (
    <div className="flex items-center gap-2">
      <div className="bg-ink text-chalk font-mono text-xs px-2 py-1 font-bold tracking-wider">
        CAT
      </div>
      <span className={`font-display tracking-wider text-ink ${sizes[size]}`}>
        SYSTEM
      </span>
    </div>
  )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export function PageShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {children}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div
      className={`${sizes[size]} border-2 border-mist border-t-ink rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
}

// ─── Full-page loader ─────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <Spinner size="lg" />
      </div>
    </div>
  )
}

// ─── Error message ────────────────────────────────────────────────────────────
export function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-body">
      {message}
    </div>
  )
}

// ─── Success message ──────────────────────────────────────────────────────────
export function SuccessMsg({ message }: { message: string }) {
  return (
    <div className="border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 font-body">
      {message}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  dark = false,
}: {
  label: string
  value: string | number
  sub?: string
  dark?: boolean
}) {
  return (
    <div className={dark ? 'card-dark' : 'card'}>
      <p className={`section-label mb-2 ${dark ? 'text-chalk/50' : ''}`}>{label}</p>
      <p className={`font-display text-3xl tracking-wide ${dark ? 'text-chalk' : 'text-ink'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-1 font-body ${dark ? 'text-chalk/50' : 'text-steel'}`}>{sub}</p>
      )}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-steel mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-steel font-body text-sm">{message}</p>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-chalk border border-mist w-full max-w-lg animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-mist">
          <h2 className="font-display text-xl tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-steel hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Ability badge ────────────────────────────────────────────────────────────
export function AbilityBadge({ level }: { level: 'Low' | 'Average' | 'High' | null | undefined }) {
  if (!level) return <span className="badge bg-mist text-steel">—</span>
  const cls = {
    Low:     'badge badge-low',
    Average: 'badge badge-average',
    High:    'badge badge-high',
  }[level]
  return <span className={cls}>{level}</span>
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────
export function DifficultyBadge({ level }: { level: string }) {
  const cls = {
    Easy:      'badge badge-easy',
    Moderate:  'badge badge-moderate',
    Difficult: 'badge badge-difficult',
  }[level] ?? 'badge bg-mist text-steel'
  return <span className={cls}>{level}</span>
}
