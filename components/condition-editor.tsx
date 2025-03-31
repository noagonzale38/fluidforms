"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { FormCondition } from "@/types/form"
import { Plus, Trash2 } from "lucide-react"

type ConditionEditorProps = {
  conditions: FormCondition[]
  onChange: (conditions: FormCondition[]) => void
}

export function ConditionEditor({ conditions, onChange }: ConditionEditorProps) {
  const addCondition = () => {
    onChange([
      ...conditions,
      {
        id: `condition-${Date.now()}`,
        elementId: "",
        operator: "equals",
        value: "",
      },
    ])
  }

  const updateCondition = (index: number, updates: Partial<FormCondition>) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    onChange(newConditions)
  }

  const removeCondition = (index: number) => {
    const newConditions = [...conditions]
    newConditions.splice(index, 1)
    onChange(newConditions)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Conditional Logic</h3>
        <Button variant="outline" size="sm" onClick={addCondition} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" /> Add Condition
        </Button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">
            No conditions added yet. Add a condition to make this field appear only when specific criteria are met.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <Select
                  value={condition.elementId}
                  onValueChange={(value) => updateCondition(index, { elementId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field-1">Question 1</SelectItem>
                    <SelectItem value="field-2">Question 2</SelectItem>
                    <SelectItem value="field-3">Question 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, { operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                    <SelectItem value="less_than">Less than</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Value"
                />
              </div>

              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCondition(index)}
                  className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

