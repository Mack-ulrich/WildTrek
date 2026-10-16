import { Card, CardContent, CardHeader, CardTitle } from "@/card"
import { cn } from "@/utils"
import type { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: LucideIcon
  description?: string
}

export function MetricsCard({ title, value, change, changeType = "neutral", icon: Icon, description }: MetricsCardProps) {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change || description) && (
          <p className={cn("text-xs mt-1", change ? changeColors[changeType] : "text-muted-foreground")}>
            {change ?? description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
