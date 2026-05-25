'use client'

import { useId } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PhotoUpload, type PhotoFile } from './photo-upload'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  step_number: number
  title: string
  description: string
  photos: PhotoFile[]
  warning: string
}

interface StepBuilderProps {
  steps: Step[]
  onChange: (steps: Step[]) => void
}

export function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const uid = useId()

  const addStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      step_number: steps.length + 1,
      title: '',
      description: '',
      photos: [],
      warning: '',
    }
    onChange([...steps, newStep])
  }

  const removeStep = (id: string) => {
    const updated = steps
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, step_number: i + 1 }))
    onChange(updated)
  }

  const updateStep = (id: string, patch: Partial<Step>) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newSteps.length) return
    ;[newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]]
    onChange(newSteps.map((s, i) => ({ ...s, step_number: i + 1 })))
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step.step_number}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => moveStep(index, 'up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === steps.length - 1}
                  onClick={() => moveStep(index, 'down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-title-${step.id}`}>Step Title</Label>
              <Input
                id={`${uid}-title-${step.id}`}
                placeholder="e.g. Remove the air filter cover"
                value={step.title}
                onChange={(e) => updateStep(step.id, { title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-desc-${step.id}`}>Instructions</Label>
              <Textarea
                id={`${uid}-desc-${step.id}`}
                placeholder="Detailed step-by-step instructions..."
                rows={3}
                value={step.description}
                onChange={(e) => updateStep(step.id, { description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                Warning (optional)
              </Label>
              <Input
                id={`${uid}-warn-${step.id}`}
                placeholder="e.g. Disconnect the battery before this step"
                value={step.warning}
                onChange={(e) => updateStep(step.id, { warning: e.target.value })}
                className={cn(step.warning && 'border-yellow-400 focus-visible:ring-yellow-400')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Step Photo (optional)</Label>
              <PhotoUpload
                photos={step.photos}
                onChange={(photos) => updateStep(step.id, { photos })}
                maxFiles={1}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addStep}>
        <Plus className="mr-2 h-4 w-4" />
        Add Step
      </Button>
    </div>
  )
}
