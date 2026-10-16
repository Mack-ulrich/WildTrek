import * as React from "react"
import { cn } from "@/utils"

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function Item({ title, description, icon, action, className, ...props }: ItemProps) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)} {...props}>
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium text-gray-900 truncate">{title}</p>}
        {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
