'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { Nav } from '@/components/nav'
import { StepBuilder, type Step } from '@/components/step-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { bikesApi, contributionsApi, type Bike } from '@/lib/api'

const schema = z.object({
  bike_id: z.string().min(1, 'Select a bike'),
  title: z.string().min(5, 'Title required (min 5 chars)'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimated_minutes: z.coerce.number().min(1).optional(),
  tools_required: z.array(z.string()),
})

type FormData = z.infer<typeof schema>

export default function SubmitGuidePage() {
  const [bikes, setBikes] = useState<Bike[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [toolInput, setToolInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'BEGINNER', tools_required: [] },
  })

  const tools = watch('tools_required')

  useEffect(() => {
    bikesApi
      .list()
      .then((res) => setBikes(res.data))
      .catch(() => toast.error('Failed to load bikes'))
  }, [])

  const addTool = () => {
    const trimmed = toolInput.trim()
    if (trimmed && !tools.includes(trimmed)) {
      setValue('tools_required', [...tools, trimmed])
    }
    setToolInput('')
  }

  const removeTool = (tool: string) => {
    setValue(
      'tools_required',
      tools.filter((t) => t !== tool)
    )
  }

  const onSubmit = async (values: FormData) => {
    if (steps.length === 0) {
      toast.error('Add at least one step')
      return
    }
    setSubmitting(true)
    try {
      await contributionsApi.submit({
        content_type: 'guide',
        content_id: null,
        data: {
          ...values,
          steps: steps.map((s) => ({
            step_number: s.step_number,
            title: s.title,
            description: s.description,
            warning: s.warning || null,
            photo_url: s.photos[0]?.file.name ?? null,
          })),
        },
      })
      toast.success('Guide submitted for review!')
      reset()
      setSteps([])
      setToolInput('')
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
          <h1 className="text-2xl font-bold">Submit a DIY Guide</h1>
          <p className="text-muted-foreground">
            Create a step-by-step maintenance guide. Expert reviewers will validate it before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bike & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guide Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Bike</Label>
                <Controller
                  name="bike_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bike" />
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
                  <p className="text-xs text-destructive">{errors.bike_id.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Guide Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. How to change front brake pads"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">🟢 Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">🟡 Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">🔴 Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="estimated_minutes">Time (minutes)</Label>
                  <Input
                    id="estimated_minutes"
                    type="number"
                    min={1}
                    placeholder="e.g. 30"
                    {...register('estimated_minutes')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Tools Required</Label>
                <div className="flex gap-2">
                  <Input
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder="e.g. 10mm wrench"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTool()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTool}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="gap-1">
                        {tool}
                        <button
                          type="button"
                          onClick={() => removeTool(tool)}
                          className="ml-0.5 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Steps</CardTitle>
              <CardDescription>
                Add ordered steps. Drag handles let you reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StepBuilder steps={steps} onChange={setSteps} />
              {steps.length === 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  No steps yet — click &quot;Add Step&quot; to begin.
                </p>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting || steps.length === 0}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Guide for Review
          </Button>
        </form>
      </main>
    </>
  )
}
