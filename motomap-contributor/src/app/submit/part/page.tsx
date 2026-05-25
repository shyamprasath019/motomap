'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Nav } from '@/components/nav'
import { PhotoUpload, type PhotoFile } from '@/components/photo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { bikesApi, contributionsApi, type Bike } from '@/lib/api'

const CATEGORIES = [
  'Engine',
  'Brakes',
  'Suspension',
  'Electrical',
  'Fuel System',
  'Cooling',
  'Transmission',
  'Body & Frame',
  'Exhaust',
  'Wheels & Tyres',
  'Lights',
  'Controls',
  'Other',
]

const schema = z.object({
  bike_id: z.string().min(1, 'Select a bike'),
  name: z.string().min(2, 'Part name required'),
  category: z.string().min(1, 'Select a category'),
  function: z.string().min(10, 'Describe the part function (min 10 chars)'),
  failure_consequences: z.string().min(10, 'Describe failure consequences (min 10 chars)'),
  risk_level: z.enum(['SAFE', 'CAUTION', 'STOP']),
  diy_fixable: z.boolean(),
  quick_fix: z.string(),
  cost_range_min: z.coerce.number().min(0).optional(),
  cost_range_max: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

export default function SubmitPartPage() {
  const [bikes, setBikes] = useState<Bike[]>([])
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bikesLoading, setBikesLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { diy_fixable: false, risk_level: 'SAFE' },
  })

  const diyFixable = watch('diy_fixable')

  useEffect(() => {
    bikesApi
      .list()
      .then((res) => setBikes(res.data))
      .catch(() => toast.error('Failed to load bikes'))
      .finally(() => setBikesLoading(false))
  }, [])

  const onSubmit = async (values: FormData) => {
    setSubmitting(true)
    try {
      await contributionsApi.submit({
        content_type: 'part',
        content_id: null,
        data: {
          ...values,
          photo_urls: photos.map((p) => p.file.name),
        },
      })
      toast.success('Part submitted for review!')
      reset()
      setPhotos([])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="container max-w-2xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submit a Part</h1>
          <p className="text-muted-foreground">
            Contribute motorcycle part knowledge. Submissions are reviewed by expert mechanics.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bike Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bike</CardTitle>
              <CardDescription>Which bike does this part belong to?</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="bike_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={bikesLoading ? 'Loading bikes…' : 'Select bike'} />
                    </SelectTrigger>
                    <SelectContent>
                      {bikes.map((bike) => (
                        <SelectItem key={bike.id} value={bike.id}>
                          {bike.make} {bike.model} ({bike.year_start}
                          {bike.year_end ? `–${bike.year_end}` : '+'})
                          {bike.variant ? ` · ${bike.variant}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bike_id && (
                <p className="mt-1 text-xs text-destructive">{errors.bike_id.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Part Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Part Name</Label>
                <Input id="name" placeholder="e.g. Front Brake Pads" {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="function">Function</Label>
                <Textarea
                  id="function"
                  placeholder="What does this part do? How does it work?"
                  rows={3}
                  {...register('function')}
                />
                {errors.function && (
                  <p className="text-xs text-destructive">{errors.function.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="failure_consequences">Failure Consequences</Label>
                <Textarea
                  id="failure_consequences"
                  placeholder="What happens when this part fails? What are the safety risks?"
                  rows={3}
                  {...register('failure_consequences')}
                />
                {errors.failure_consequences && (
                  <p className="text-xs text-destructive">{errors.failure_consequences.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk & DIY */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk & Repair</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Risk Level</Label>
                <Controller
                  name="risk_level"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAFE">
                          🟢 SAFE — Can continue riding with caution
                        </SelectItem>
                        <SelectItem value="CAUTION">
                          🟡 CAUTION — Repair soon, monitor closely
                        </SelectItem>
                        <SelectItem value="STOP">
                          🔴 STOP — Do not ride, fix immediately
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Risk level tags require Expert Reviewer approval before publishing.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="diy_fixable">DIY Fixable</Label>
                  <p className="text-xs text-muted-foreground">Can a home mechanic fix this?</p>
                </div>
                <Controller
                  name="diy_fixable"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="diy_fixable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {diyFixable && (
                <div className="space-y-1.5">
                  <Label htmlFor="quick_fix">Quick Fix Tip</Label>
                  <Textarea
                    id="quick_fix"
                    placeholder="Brief instructions for a temporary or quick fix…"
                    rows={2}
                    {...register('quick_fix')}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-1.5">
                <Label>Estimated Repair Cost (₹)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    {...register('cost_range_min')}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    {...register('cost_range_max')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photos</CardTitle>
              <CardDescription>Up to 5 photos of the part (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload photos={photos} onChange={setPhotos} maxFiles={5} />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Review
          </Button>
        </form>
      </main>
    </>
  )
}
