"use client"

import { useState } from "react"
import type { FormElement } from "@/types/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type FormElementPreviewProps = {
  element: FormElement
  value?: any
  onChange?: (value: any) => void
}

export function FormElementPreview({ element, value, onChange }: FormElementPreviewProps) {
  const { type, label, required, properties } = element
  const [date, setDate] = useState<Date | undefined>()

  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  const renderDescription = () => {
    if (!properties?.description) return null
    return <p className="text-sm text-muted-foreground mb-2">{properties.description}</p>
  }

  const renderRequiredIndicator = () => {
    if (!required) return null
    return <span className="text-destructive ml-1">*</span>
  }

  switch (type) {
    case "short-answer":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input
            placeholder="Short answer text"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="text-base"
          />
        </div>
      )

    case "paragraph":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Textarea
            placeholder="Long answer text"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="text-base"
          />
        </div>
      )

    case "number":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input
            type="number"
            placeholder="0"
            value={value || ""}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="text-base"
          />
        </div>
      )

    case "multiple-choice":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <RadioGroup value={value || ""} onValueChange={handleChange}>
            {(properties?.options || ["Option 1", "Option 2", "Option 3"]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${element.id}-${index}`} />
                <Label htmlFor={`option-${element.id}-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case "checkboxes":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <div className="space-y-2">
            {(properties?.options || ["Option 1", "Option 2", "Option 3"]).map((option, index) => {
              const isChecked = Array.isArray(value) ? value.includes(option) : false

              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`checkbox-${element.id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (!Array.isArray(value)) {
                        handleChange(checked ? [option] : [])
                      } else {
                        if (checked) {
                          handleChange([...value, option])
                        } else {
                          handleChange(value.filter((item: string) => item !== option))
                        }
                      }
                    }}
                  />
                  <Label htmlFor={`checkbox-${element.id}-${index}`} className="text-base">
                    {option}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      )

    case "dropdown":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Select value={value || ""} onValueChange={handleChange}>
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(properties?.options || ["Option 1", "Option 2", "Option 3"]).map((option, index) => (
                <SelectItem key={index} value={option} className="text-base">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case "date":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal text-base",
                  !value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )

    case "email":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input
            type="email"
            placeholder="email@example.com"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="text-base"
          />
        </div>
      )

    case "phone-number":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="text-base"
          />
        </div>
      )

    case "website-url":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input
            type="url"
            placeholder="https://example.com"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="text-base"
          />
        </div>
      )

    case "rating-scale":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <div className="flex items-center justify-between">
            <span className="text-sm">{properties?.minValue || 1}</span>
            <div className="flex-1 mx-4">
              <Slider
                value={value ? [value] : [properties?.minValue || 1]}
                min={properties?.minValue || 1}
                max={properties?.maxValue || 5}
                step={properties?.step || 1}
                onValueChange={(values) => handleChange(values[0])}
              />
            </div>
            <span className="text-sm">{properties?.maxValue || 5}</span>
          </div>
        </div>
      )

    case "time":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <Input type="time" value={value || ""} onChange={(e) => handleChange(e.target.value)} className="text-base" />
        </div>
      )

    case "range-slider":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {renderRequiredIndicator()}
          </Label>
          {renderDescription()}
          <div className="flex items-center justify-between">
            <span className="text-sm">{properties?.minValue || 0}</span>
            <div className="flex-1 mx-4">
              <Slider
                value={value ? [value] : [properties?.minValue || 0]}
                min={properties?.minValue || 0}
                max={properties?.maxValue || 100}
                step={properties?.step || 1}
                onValueChange={(values) => handleChange(values[0])}
              />
            </div>
            <span className="text-sm">{properties?.maxValue || 100}</span>
          </div>
        </div>
      )

    case "section":
      return (
        <div className="space-y-2 py-2">
          <h3 className="text-xl font-medium">{label}</h3>
          {renderDescription()}
          <div className="border-t border-border/50 pt-2"></div>
        </div>
      )

    default:
      return (
        <div className="p-4 border border-dashed rounded-md">
          <p className="text-muted-foreground">Unknown element type: {type}</p>
        </div>
      )
  }
}

