export type FormElementType =
  | "short-answer"
  | "paragraph"
  | "number"
  | "multiple-choice"
  | "checkboxes"
  | "dropdown"
  | "image-selection"
  | "date"
  | "email"
  | "phone-number"
  | "website-url"
  | "rating-scale"
  | "time"
  | "range-slider"
  | "section"

export type FormConditionOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than"

export type FormCondition = {
  id: string
  elementId: string
  operator: FormConditionOperator | string
  value: string
}

export type FormElement = {
  id: string
  type: FormElementType
  label: string
  required: boolean
  properties?: Record<string, any>
  conditions: FormCondition[]
}

export type Form = {
  id: string
  title: string
  description?: string
  elements: FormElement[]
  createdAt: string
  updatedAt: string
  createdBy: string
  status: "draft" | "active" | "archived"
}

export type FormResponse = {
  id: string
  formId: string
  respondentId?: string
  data: Record<string, any>
  createdAt: string
  updatedAt: string
  status: "partial" | "complete"
}

