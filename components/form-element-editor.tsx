"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormElement } from "@/types/form"
import { ConditionEditor } from "@/components/condition-editor"
import { X } from "lucide-react"

type FormElementEditorProps = {
  element: FormElement
  updateElement: (updates: Partial<FormElement>) => void
  onClose: () => void
}

export function FormElementEditor({ element, updateElement, onClose }: FormElementEditorProps) {
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Edit Element</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="element-label">Label</Label>
            <Input
              id="element-label"
              value={element.label}
              onChange={(e) => updateElement({ label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-description">Description (optional)</Label>
            <Textarea
              id="element-description"
              value={element.properties?.description || ""}
              onChange={(e) =>
                updateElement({
                  properties: {
                    ...element.properties,
                    description: e.target.value,
                  },
                })
              }
              placeholder="Add a description to help users understand this field"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="element-required"
              checked={element.required}
              onCheckedChange={(checked) => updateElement({ required: checked })}
            />
            <Label htmlFor="element-required">Required field</Label>
          </div>
        </TabsContent>

        <TabsContent value="options" className="mt-4 space-y-4">
          {(element.type === "multiple-choice" || element.type === "checkboxes" || element.type === "dropdown") && (
            <div className="space-y-4">
              <Label>Options</Label>
              {(element.properties?.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.properties?.options || [])]
                      newOptions[index] = e.target.value
                      updateElement({
                        properties: {
                          ...element.properties,
                          options: newOptions,
                        },
                      })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = [...(element.properties?.options || [])]
                      newOptions.splice(index, 1)
                      updateElement({
                        properties: {
                          ...element.properties,
                          options: newOptions,
                        },
                      })
                    }}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  updateElement({
                    properties: {
                      ...element.properties,
                      options: [...(element.properties?.options || []), "New Option"],
                    },
                  })
                }}
                className="rounded-full"
              >
                Add Option
              </Button>
            </div>
          )}

          {element.type === "rating-scale" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-value">Minimum Value</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={element.properties?.minValue || 1}
                    onChange={(e) =>
                      updateElement({
                        properties: {
                          ...element.properties,
                          minValue: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-value">Maximum Value</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={element.properties?.maxValue || 5}
                    onChange={(e) =>
                      updateElement({
                        properties: {
                          ...element.properties,
                          maxValue: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-value">Step</Label>
                <Input
                  id="step-value"
                  type="number"
                  value={element.properties?.step || 1}
                  onChange={(e) =>
                    updateElement({
                      properties: {
                        ...element.properties,
                        step: Number.parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {element.type === "range-slider" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-value">Minimum Value</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={element.properties?.minValue || 0}
                    onChange={(e) =>
                      updateElement({
                        properties: {
                          ...element.properties,
                          minValue: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-value">Maximum Value</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={element.properties?.maxValue || 100}
                    onChange={(e) =>
                      updateElement({
                        properties: {
                          ...element.properties,
                          maxValue: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-value">Step</Label>
                <Input
                  id="step-value"
                  type="number"
                  value={element.properties?.step || 1}
                  onChange={(e) =>
                    updateElement({
                      properties: {
                        ...element.properties,
                        step: Number.parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conditions" className="mt-4">
          <ConditionEditor
            conditions={element.conditions || []}
            onChange={(conditions) => updateElement({ conditions })}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

