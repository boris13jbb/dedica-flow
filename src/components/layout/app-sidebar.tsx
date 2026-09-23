'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Layers,
  LayoutTemplate,
  ImageIcon,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { LogoutButton } from '@/components/admin/logout-button'
import { getInitials } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  match?: (pathname: string) => boolean
  /** Sin ruta real: se muestra deshabilitado (no 404) */
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Inicio',
    icon: Home,
    match: (pathname) => pathname === '/admin',
  },
  {
    href: '/admin',
    label: 'Tus experiencias',
    icon: Layers,
    match: (pathname) => pathname.startsWith('/admin/projects'),
  },
  {
    label: 'Medios',
    icon: ImageIcon,
    disabled: true,
  },
  {
    href: '/admin/projects/new',
    label: 'Plantillas',
    icon: LayoutTemplate,
    match: (pathname) => pathname === '/admin/projects/new',
  },
  {
    label: 'Configuración',
    icon: Settings,
    disabled: true,
  },
]

interface AppSidebarProps {
  email?: string | null
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

function NavItemRow({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const className = cn(
    'group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary',
    collapsed && 'justify-center px-2',
    item.disabled
      ? 'cursor-not-allowed text-df-muted-fg opacity-50'
      : active
        ? 'bg-df-primary/10 text-df-fg'
        : 'text-df-muted hover:bg-df-surface hover:text-df-fg'
  )

  const content = (
    <>
      <Icon
        className={cn(
          'size-[18px] shrink-0',
          item.disabled
            ? 'text-df-muted-fg'
            : active
              ? 'text-df-primary'
              : 'text-df-muted-fg group-hover:text-df-fg'
        )}
      />
      {!collapsed && (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
          <span className="truncate">{item.label}</span>
          {item.disabled && (
            <span className="shrink-0 text-[10px] font-normal text-df-muted-fg">
              Pronto
            </span>
          )}
        </span>
      )}
    </>
  )

  if (item.disabled || !item.href) {
    const disabledEl = (
      <span
        className={className}
        aria-disabled="true"
        title={collapsed ? `${item.label} (próximamente)` : undefined}
      >
        {content}
      </span>
    )
    return collapsed ? (
      <Tooltip content={`${item.label} · Próximamente`}>{disabledEl}</Tooltip>
    ) : (
      disabledEl
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={className}
    >
      {content}
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
          className="min-w-0 rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary"
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
            className="absolute right-2 top-3"
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
          <NavItemRow
            key={item.label}
            item={item}
            active={Boolean(item.match?.(pathname))}
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
 * Sidebar desktop + drawer móvil. Solo enlaza rutas reales;
 * Medios/Configuración aparecen deshabilitados (sin 404).
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
