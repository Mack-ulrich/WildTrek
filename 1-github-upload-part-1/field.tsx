import * as React from "react"
import { cn } from "@/utils"

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, className, children, ...props }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && <label className={cn("text-sm font-medium leading-none", error && "text-destructive")}>{label}</label>}
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
