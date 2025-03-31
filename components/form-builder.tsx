"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormElementEditor } from "@/components/form-element-editor"
import { FormElementPreview } from "@/components/form-element-preview"
import { Plus, GripVertical, Trash2, Copy, Settings } from "lucide-react"
import type { FormElementType, FormElement } from "@/types/form"
import { formElementTypes } from "@/lib/form-element-types"

type FormBuilderProps = {
  elements: FormElement[]
  setElements: (elements: FormElement[]) => void
}

export function FormBuilder({ elements, setElements }: FormBuilderProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  const addElement = (type: FormElementType) => {
    const newElement: FormElement = {
      id: `element-${Date.now()}`,
      type,
      label: `New ${type}`,
      required: false,
      properties: {},
      conditions: [],
    }

    setElements([...elements, newElement])
    setSelectedElementId(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    setElements(elements.map((element) => (element.id === id ? { ...element, ...updates } : element)))
  }

  const duplicateElement = (id: string) => {
    const elementToDuplicate = elements.find((element) => element.id === id)
    if (!elementToDuplicate) return

    const newElement = {
      ...elementToDuplicate,
      id: `element-${Date.now()}`,
      label: `${elementToDuplicate.label} (Copy)`,
    }

    const index = elements.findIndex((element) => element.id === id)
    const newElements = [...elements]
    newElements.splice(index + 1, 0, newElement)

    setElements(newElements)
    setSelectedElementId(newElement.id)
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((element) => element.id !== id))
    if (selectedElementId === id) {
      setSelectedElementId(null)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(elements)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setElements(items)
  }

  const selectedElement = elements.find((element) => element.id === selectedElementId)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Form Builder</h2>
            <Button
              variant="outline"
              className="rounded-full text-base px-4 py-2 h-auto"
              onClick={() => setSelectedElementId(null)}
            >
              <Plus className="h-5 w-5 mr-2" /> Add Element
            </Button>
          </div>

          {!selectedElementId && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" className="text-base py-2">
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="choice" className="text-base py-2">
                    Choice
                  </TabsTrigger>
                  <TabsTrigger value="special" className="text-base py-2">
                    Special
                  </TabsTrigger>
                  <TabsTrigger value="scale" className="text-base py-2">
                    Scale
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formElementTypes
                      .filter((type) => type.category === "text")
                      .map((type) => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="h-auto flex items-center justify-start p-4 rounded-xl text-base w-full"
                          onClick={() => addElement(type.value as FormElementType)}
                        >
                          <div className="mr-3 flex-shrink-0">{type.icon}</div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium truncate">{type.label}</div>
                            <div className="text-sm text-muted-foreground truncate">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="choice" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formElementTypes
                      .filter((type) => type.category === "choice")
                      .map((type) => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="h-auto flex items-center justify-start p-4 rounded-xl text-base w-full"
                          onClick={() => addElement(type.value as FormElementType)}
                        >
                          <div className="mr-3 flex-shrink-0">{type.icon}</div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium truncate">{type.label}</div>
                            <div className="text-sm text-muted-foreground truncate">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="special" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formElementTypes
                      .filter((type) => type.category === "special")
                      .map((type) => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="h-auto flex items-center justify-start p-4 rounded-xl text-base w-full"
                          onClick={() => addElement(type.value as FormElementType)}
                        >
                          <div className="mr-3 flex-shrink-0">{type.icon}</div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium truncate">{type.label}</div>
                            <div className="text-sm text-muted-foreground truncate">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="scale" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formElementTypes
                      .filter((type) => type.category === "scale")
                      .map((type) => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="h-auto flex items-center justify-start p-4 rounded-xl text-base w-full"
                          onClick={() => addElement(type.value as FormElementType)}
                        >
                          <div className="mr-3 flex-shrink-0">{type.icon}</div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium truncate">{type.label}</div>
                            <div className="text-sm text-muted-foreground truncate">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {selectedElementId && selectedElement && (
            <FormElementEditor
              element={selectedElement}
              updateElement={(updates) => updateElement(selectedElement.id, updates)}
              onClose={() => setSelectedElementId(null)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Form Preview</h2>

          {elements.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-base text-muted-foreground">Your form is empty. Add elements to get started.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-elements">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {elements.map((element, index) => (
                      <Draggable key={element.id} draggableId={element.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`form-element group ${
                              selectedElementId === element.id ? "form-element-selected" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 rounded-md hover:bg-secondary/50 cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <div className="flex-1">
                                <FormElementPreview element={element} />
                              </div>

                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full"
                                  onClick={() => setSelectedElementId(element.id)}
                                >
                                  <Settings className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full"
                                  onClick={() => duplicateElement(element.id)}
                                >
                                  <Copy className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full text-destructive hover:text-destructive"
                                  onClick={() => deleteElement(element.id)}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

