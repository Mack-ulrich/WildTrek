import * as React from "react"
import { cn } from "@/utils"

const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none", className)} {...props} />
  )
)
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
