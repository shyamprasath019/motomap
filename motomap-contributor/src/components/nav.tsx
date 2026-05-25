'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Bike, ClipboardList, User, PlusCircle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBackendAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'

const navLinks = [
  { href: '/submit/part', label: 'Submit Part', icon: PlusCircle },
  { href: '/submit/guide', label: 'Submit Guide', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
]

const expertLinks = [
  { href: '/review/queue', label: 'Review Queue', icon: ClipboardList },
]

const EXPERT_ROLES = new Set(['EXPERT_REVIEWER', 'BRAND_OFFICIAL', 'ADMIN'])

export function Nav() {
  const pathname = usePathname()
  const { backendUser } = useBackendAuth()

  const isExpert = backendUser && EXPERT_ROLES.has(backendUser.role)
  const allLinks = isExpert ? [...navLinks, ...expertLinks] : navLinks

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-6">
        <Link href="/submit/part" className="flex items-center gap-2 font-bold text-primary">
          <Bike className="h-5 w-5" />
          <span className="hidden sm:inline">Motomap Contributor</span>
          <span className="sm:hidden">Motomap</span>
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {allLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
                pathname.startsWith(href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {backendUser && (
            <Badge variant="secondary" className="hidden sm:flex">
              {backendUser.role.replace('_', ' ')}
            </Badge>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </nav>
  )
}
