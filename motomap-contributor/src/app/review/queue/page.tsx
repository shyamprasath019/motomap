'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Nav } from '@/components/nav'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { contributionsApi, type Contribution, type ContributionStatus } from '@/lib/api'
import { useBackendAuth } from '@/lib/auth-context'

type StatusTab = 'PENDING' | 'APPROVED' | 'REJECTED'

const STATUS_VARIANT: Record<ContributionStatus, BadgeProps['variant']> = {
  PENDING: 'warning',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
}

function DataDiff({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false)
  const entries = Object.entries(data)
  const visible = expanded ? entries : entries.slice(0, 6)

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs font-mono">
      <table className="w-full">
        <tbody>
          {visible.map(([k, v]) => (
            <tr key={k} className="align-top">
              <td className="w-40 pr-3 font-semibold text-muted-foreground">{k}</td>
              <td className="break-all text-foreground">
                {v === null || v === undefined
                  ? <span className="text-muted-foreground italic">null</span>
                  : typeof v === 'boolean'
                  ? <span className={v ? 'text-green-700' : 'text-red-700'}>{String(v)}</span>
                  : Array.isArray(v)
                  ? <span>{JSON.stringify(v)}</span>
                  : typeof v === 'object'
                  ? <span className="whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</span>
                  : String(v)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length > 6 && (
        <button
          className="mt-2 flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((x) => !x)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Show less' : `Show ${entries.length - 6} more fields`}
        </button>
      )}
    </div>
  )
}

function ContributionCard({
  contribution,
  onApprove,
  onReject,
}: {
  contribution: Contribution
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isPending = contribution.status === 'PENDING'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize">
                {contribution.content_type.replace('_', ' ')}
              </span>
              <Badge variant={STATUS_VARIANT[contribution.status]}>
                {contribution.status}
              </Badge>
              <Badge variant="outline">v{contribution.version}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}
              {' · '}
              ID: {contribution.id.slice(0, 8)}…
            </p>
          </div>

          {isPending && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-50"
                onClick={() => onApprove(contribution.id)}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50"
                onClick={() => onReject(contribution.id)}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <button
          className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((x) => !x)}
        >
          <span>Contribution data</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && <DataDiff data={contribution.data} />}

        {contribution.review_notes && (
          <div className="rounded-md border border-muted bg-muted/20 p-3 text-sm">
            <span className="font-medium text-muted-foreground">Review notes: </span>
            {contribution.review_notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ReviewQueuePage() {
  const { backendUser } = useBackendAuth()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<StatusTab>('PENDING')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const EXPERT_ROLES = new Set(['EXPERT_REVIEWER', 'BRAND_OFFICIAL', 'ADMIN'])
  const isExpert = backendUser && EXPERT_ROLES.has(backendUser.role)

  const fetchContributions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await contributionsApi.list(activeTab as ContributionStatus)
      setContributions(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (isExpert) fetchContributions()
  }, [isExpert, fetchContributions])

  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      await contributionsApi.approve(id)
      toast.success('Contribution approved')
      fetchContributions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    if (!rejectNote.trim()) {
      toast.error('Rejection note is required')
      return
    }
    setActionLoading(true)
    try {
      await contributionsApi.reject(rejectTarget, rejectNote.trim())
      toast.success('Contribution rejected')
      setRejectTarget(null)
      setRejectNote('')
      fetchContributions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (!isExpert) {
    return (
      <>
        <Nav />
        <main className="container py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="mt-2 text-muted-foreground">
              The review queue requires Expert Reviewer role or higher.
            </p>
            {backendUser && (
              <p className="mt-1 text-sm text-muted-foreground">
                Your current role: <strong>{backendUser.role.replace('_', ' ')}</strong>
              </p>
            )}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="container max-w-3xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">Expert dashboard — approve or reject contributions</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchContributions} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)}>
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>

          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))
              ) : contributions.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="mb-3 h-10 w-10 opacity-40" />
                  <p>No {tab.toLowerCase()} contributions</p>
                </div>
              ) : (
                contributions.map((c) => (
                  <ContributionCard
                    key={c.id}
                    contribution={c}
                    onApprove={handleApprove}
                    onReject={(id) => {
                      setRejectTarget(id)
                      setRejectNote('')
                    }}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>
              Provide a clear reason. Contributors will see this note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">Rejection Note</Label>
            <Textarea
              id="reject-note"
              placeholder="e.g. Incorrect risk level — brake failure should be STOP, not CAUTION."
              rows={4}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectNote.trim()}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
