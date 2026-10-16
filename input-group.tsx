import * as React from "react"
import { cn } from "@/utils"

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex", className)} {...props} />
  )
)
InputGroup.displayName = "InputGroup"

export { InputGroup }
