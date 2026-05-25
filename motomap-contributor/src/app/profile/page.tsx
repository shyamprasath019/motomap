'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import {
  User,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Bike,
  Star,
  Wrench,
} from 'lucide-react'
import { Nav } from '@/components/nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { contributionsApi, type Contribution, type UserRole } from '@/lib/api'
import { useBackendAuth } from '@/lib/auth-context'

const ROLE_META: Record<
  UserRole,
  { label: string; color: string; icon: React.ElementType; description: string }
> = {
  RIDER: {
    label: 'Rider',
    color: 'secondary',
    icon: Bike,
    description: 'Community contributor',
  },
  VERIFIED_ENTHUSIAST: {
    label: 'Verified Enthusiast',
    color: 'info',
    icon: Star,
    description: 'Trusted community member',
  },
  EXPERT_REVIEWER: {
    label: 'Expert Reviewer',
    color: 'success',
    icon: ShieldCheck,
    description: 'Certified mechanic / expert',
  },
  BRAND_OFFICIAL: {
    label: 'Brand Official',
    color: 'warning',
    icon: Award,
    description: 'Official brand representative',
  },
  ADMIN: {
    label: 'Admin',
    color: 'default',
    icon: Wrench,
    description: 'Platform administrator',
  },
}

const EXPERT_ROLES = new Set(['EXPERT_REVIEWER', 'BRAND_OFFICIAL', 'ADMIN'])

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: number
  icon: React.ElementType
  className?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-full p-2 ${className}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser()
  const { backendUser, loading } = useBackendAuth()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [contribLoading, setContribLoading] = useState(false)

  const isExpert = backendUser && EXPERT_ROLES.has(backendUser.role)

  useEffect(() => {
    if (!isExpert) return
    setContribLoading(true)
    Promise.all([
      contributionsApi.list('APPROVED'),
      contributionsApi.list('PENDING'),
      contributionsApi.list('REJECTED'),
    ])
      .then(([approved, pending, rejected]) => {
        const myId = backendUser?.id
        const myApproved = approved.data.filter((c) => c.contributor_id === myId)
        const myPending = pending.data.filter((c) => c.contributor_id === myId)
        const myRejected = rejected.data.filter((c) => c.contributor_id === myId)
        setStats({
          total: myApproved.length + myPending.length + myRejected.length,
          approved: myApproved.length,
          pending: myPending.length,
          rejected: myRejected.length,
        })
        setContributions(
          [...myApproved, ...myPending, ...myRejected].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      })
      .catch(() => {})
      .finally(() => setContribLoading(false))
  }, [isExpert, backendUser?.id])

  const roleMeta = backendUser ? ROLE_META[backendUser.role] : null
  const RoleIcon = roleMeta?.icon ?? User

  const badges = [
    backendUser && { label: 'Contributor', icon: '🏍️', earned: true },
    backendUser && EXPERT_ROLES.has(backendUser.role) && {
      label: 'Expert Eyes',
      icon: '🔍',
      earned: true,
    },
    stats && stats.approved >= 5 && { label: 'Quality 5', icon: '⭐', earned: true },
    stats && stats.approved >= 10 && { label: 'Power Contributor', icon: '🚀', earned: true },
  ].filter(Boolean) as Array<{ label: string; icon: string; earned: boolean }>

  return (
    <>
      <Nav />
      <main className="container max-w-2xl py-8">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>

        {/* User card */}
        {loading ? (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName ?? ''} />
                <AvatarFallback className="text-xl">
                  {(clerkUser?.fullName ?? clerkUser?.emailAddresses[0]?.emailAddress ?? '?')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {backendUser?.display_name ?? clerkUser?.fullName ?? 'Unknown'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {backendUser?.email ?? clerkUser?.emailAddresses[0]?.emailAddress}
                </p>
                {backendUser && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Member since{' '}
                    {format(new Date(backendUser.created_at), 'MMMM yyyy')}
                  </p>
                )}
              </div>
              {roleMeta && (
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <div className="flex items-center gap-1.5">
                    <RoleIcon className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={roleMeta.color as 'default'}>{roleMeta.label}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{roleMeta.description}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats — expert only */}
        {isExpert && (
          <>
            <h2 className="mb-3 font-semibold">Contribution Stats</h2>
            {contribLoading ? (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : stats ? (
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Submissions"
                  value={stats.total}
                  icon={User}
                  className="bg-blue-50 text-blue-700"
                />
                <StatCard
                  label="Approved"
                  value={stats.approved}
                  icon={CheckCircle2}
                  className="bg-green-50 text-green-700"
                />
                <StatCard
                  label="Pending"
                  value={stats.pending}
                  icon={Clock}
                  className="bg-yellow-50 text-yellow-700"
                />
                <StatCard
                  label="Rejected"
                  value={stats.rejected}
                  icon={XCircle}
                  className="bg-red-50 text-red-700"
                />
              </div>
            ) : null}

            {/* Submission history */}
            <h2 className="mb-3 font-semibold">Submission History</h2>
            <Card>
              <CardContent className="p-0">
                {contribLoading ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : contributions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No submissions yet</div>
                ) : (
                  <div className="divide-y">
                    {contributions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <span className="text-sm font-medium capitalize">
                            {c.content_type.replace('_', ' ')}
                          </span>
                          {typeof c.data.name === 'string' && (
                            <span className="ml-1 text-sm text-muted-foreground">
                              — {c.data.name}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(c.created_at), 'dd MMM yyyy')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            c.status === 'APPROVED'
                              ? 'success'
                              : c.status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!isExpert && !loading && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <ShieldCheck className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="font-medium">Detailed stats available for Expert Reviewers</p>
              <p className="mt-1 text-sm">
                Keep contributing quality content to be promoted to Verified Enthusiast or Expert Reviewer.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
