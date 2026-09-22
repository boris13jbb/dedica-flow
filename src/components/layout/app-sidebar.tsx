'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Layers,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { LogoutButton } from '@/components/admin/logout-button'
import { getInitials } from '@/lib/format'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Inicio',
    icon: Home,
    match: (pathname: string) => pathname === '/admin',
  },
  {
    href: '/admin',
    label: 'Tus experiencias',
    icon: Layers,
    // Activo en rutas de proyecto; en /admin solo destaca Inicio
    match: (pathname: string) => pathname.startsWith('/admin/projects'),
  },
  {
    href: '/admin/projects/new',
    label: 'Plantillas',
    icon: LayoutTemplate,
    match: (pathname: string) => pathname === '/admin/projects/new',
  },
] as const

interface AppSidebarProps {
  email?: string | null
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary',
        active
          ? 'bg-df-primary/10 text-df-primary-light'
          : 'text-df-muted hover:bg-df-surface hover:text-df-fg',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon
        className={cn(
          'size-[18px] shrink-0',
          active ? 'text-df-primary' : 'text-df-muted-fg group-hover:text-df-fg'
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

function SidebarContent({
  email,
  collapsed,
  onCollapsedChange,
  onNavigate,
  showCollapseToggle,
}: {
  email?: string | null
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onNavigate?: () => void
  showCollapseToggle?: boolean
}) {
  const pathname = usePathname()
  const initials = getInitials(email?.split('@')[0] || 'U')

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-14 items-center border-b border-df-border px-3',
          collapsed ? 'justify-center' : 'justify-between gap-2'
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary rounded-[var(--radius-md)]"
        >
          <Logo showWordmark={!collapsed} size="sm" />
        </Link>
        {showCollapseToggle && onCollapsedChange && !collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Colapsar menú"
            onClick={() => onCollapsedChange(true)}
          >
            <PanelLeftClose />
          </Button>
        )}
        {showCollapseToggle && onCollapsedChange && collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Expandir menú"
            onClick={() => onCollapsedChange(false)}
            className="absolute top-3 right-2"
          >
            <PanelLeft />
          </Button>
        )}
      </div>

      <nav
        aria-label="Navegación principal"
        className={cn('flex-1 space-y-1 overflow-y-auto p-3 df-scrollbar', collapsed && 'pt-10')}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={`${item.label}-${item.href}`}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={item.match(pathname)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-df-border p-3">
        <div
          className={cn(
            'mb-3 flex items-center gap-3 rounded-[var(--radius-lg)] bg-df-surface/60 px-2.5 py-2',
            collapsed && 'justify-center px-1'
          )}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-df-primary/20 text-xs font-semibold text-df-primary-light"
            aria-hidden
          >
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-df-fg">Cuenta</p>
              <p className="truncate text-[11px] text-df-muted">{email || 'Usuario'}</p>
            </div>
          )}
        </div>
        <div className={cn(collapsed && 'flex justify-center')}>
          <LogoutButton compact={collapsed} />
        </div>
      </div>
    </div>
  )
}

/**
 * Sidebar desktop + drawer móvil. Solo enlaza rutas reales existentes.
 */
export function AppSidebar({
  email,
  collapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileOpenChange,
}: AppSidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'relative hidden h-screen shrink-0 flex-col border-r border-df-border bg-df-bg-secondary lg:flex',
          'transition-[width] duration-200 ease-out',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
        aria-label="Barra lateral"
      >
        <SidebarContent
          email={email}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          showCollapseToggle
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Cerrar menú"
            onClick={() => onMobileOpenChange?.(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-df-border bg-df-bg-secondary shadow-[var(--shadow-elevated)] animate-df-slide-up"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="absolute right-2 top-2 z-10">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar"
                onClick={() => onMobileOpenChange?.(false)}
              >
                <X />
              </Button>
            </div>
            <SidebarContent
              email={email}
              collapsed={false}
              onNavigate={() => onMobileOpenChange?.(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}
