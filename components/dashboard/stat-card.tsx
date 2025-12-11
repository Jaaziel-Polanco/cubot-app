"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: string
  iconColor?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconColor = "text-primary",
  delay = 0,
}: StatCardProps) {
  const Icon = iconMap[icon]
  const count = useMotionValue(0)
  const roundedNumber = useTransform(count, (latest) => Math.round(latest))
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (typeof value === "number" && !hasAnimated.current) {
      hasAnimated.current = true
      const controls = animate(count, value, { duration: 1, delay })
      return controls.stop
    }
  }, [value, count, delay])

  if (!Icon) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-4 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              {typeof value === "number" ? (
                <motion.p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  {roundedNumber}
                </motion.p>
              ) : (
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{value}</p>
              )}
              {change && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.3 }}
                  className={cn(
                    "text-xs sm:text-sm font-medium flex items-center gap-1",
                    changeType === "positive" && "text-green-600 dark:text-green-400",
                    changeType === "negative" && "text-red-600 dark:text-red-400",
                    changeType === "neutral" && "text-muted-foreground",
                  )}
                >
                  {changeType === "positive" && "↗"}
                  {changeType === "negative" && "↘"}
                  {change}
                </motion.p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={cn(
                "p-2.5 sm:p-3 rounded-xl bg-gradient-to-br shadow-lg shrink-0",
                iconColor.includes("blue") && "from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400",
                iconColor.includes("orange") && "from-orange-500/20 to-orange-600/20 text-orange-600 dark:text-orange-400",
                iconColor.includes("green") && "from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400",
                iconColor.includes("purple") && "from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400",
                iconColor.includes("yellow") && "from-yellow-500/20 to-yellow-600/20 text-yellow-600 dark:text-yellow-400",
                !iconColor && "from-primary/20 to-accent/20 text-primary"
              )}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
