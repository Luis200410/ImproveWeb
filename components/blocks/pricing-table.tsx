"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons"
import NumberFlow from "@number-flow/react"
import { BorderTrail } from "@/components/ui/border-trail"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export type PlanLevel = "starter" | "pro" | "all" | string

export interface PricingFeature {
  name: string
  included: PlanLevel | null
}

export interface PricingPlan {
  name: string
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

export interface PricingTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  features: PricingFeature[]
  plans: PricingPlan[]
  onPlanSelect?: (plan: PlanLevel) => void
  defaultPlan?: PlanLevel
  defaultInterval?: "monthly" | "yearly"
  containerClassName?: string
  buttonClassName?: string
}

export function PricingTable({
  features,
  plans,
  onPlanSelect,
  defaultPlan = "pro",
  defaultInterval = "monthly",
  className,
  containerClassName,
  buttonClassName,
  ...props
}: PricingTableProps) {
  const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly")
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>(defaultPlan)

  const handlePlanSelect = (plan: PlanLevel) => {
    setSelectedPlan(plan)
    onPlanSelect?.(plan)
  }

  return (
    <div
      className={cn(
        "text-foreground",
        "py-12 sm:py-24 px-4",
        "fade-bottom overflow-hidden pb-0",
        className
      )}
    >
      <div
        className={cn("w-full max-w-3xl mx-auto px-4", containerClassName)}
        {...props}
      >
        <div className="flex justify-end mb-4 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                !isYearly ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                isYearly ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500",
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => handlePlanSelect(plan.level)}
              className={cn(
                "flex-1 p-6 rounded-2xl text-left transition-all relative overflow-hidden group",
                "bg-zinc-900/40 backdrop-blur-xl border border-white/5",
                selectedPlan === plan.level &&
                  "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
              )}
            >
              {selectedPlan === plan.level && (
                <BorderTrail
                  style={{
                    boxShadow: '0px 0px 40px 10px rgba(245, 158, 11, 0.4)',
                  }}
                  className="bg-amber-500"
                  size={100}
                />
              )}
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className={cn(
                  "text-xs uppercase tracking-[0.2em] font-bold",
                  selectedPlan === plan.level ? "text-amber-500" : "text-white/40"
                )}>
                  {plan.name} Protocol
                </span>
                {plan.popular && (
                  <Badge className="bg-amber-500 text-black border-none font-black text-[8px] uppercase tracking-tighter">
                    Popular
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 relative z-10 mt-6">
                <NumberFlow
                  format={{
                    style: "currency",
                    currency: "USD",
                    trailingZeroDisplay: "stripIfInteger",
                  }}
                  value={isYearly ? plan.price.yearly : plan.price.monthly}
                  className={cn(
                    "text-4xl font-black tracking-tighter",
                    selectedPlan === plan.level ? "text-amber-500" : "text-white"
                  )}
                />
                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-black/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-white/5">
              <div className="flex items-center p-6 bg-zinc-900/40 border-b border-white/5 backdrop-blur-sm">
                <div className="flex-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-amber-500/60">System Capability Protocol</div>
                <div className="flex items-center gap-12 sm:gap-16 pr-8">
                  {plans.map((plan) => (
                    <div
                      key={plan.level}
                      className={cn(
                        "w-20 text-center text-xs font-black uppercase tracking-widest transition-colors",
                        selectedPlan === plan.level ? "text-amber-500" : "text-white/30"
                      )}
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>
              {features.map((feature, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  key={feature.name}
                  className={cn(
                    "flex items-center p-5 transition-all group/row",
                    feature.included === selectedPlan &&
                      "bg-amber-500/[0.03]",
                  )}
                >
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-light text-white/70 group-hover/row:text-white transition-colors tracking-wide">
                      {feature.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-12 sm:gap-16 pr-8">
                    {plans.map((plan) => (
                      <div
                        key={plan.level}
                        className={cn(
                          "w-20 flex justify-center transition-all",
                          plan.level === selectedPlan && "scale-110",
                        )}
                      >
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <div className="relative">
                            <CheckIcon className="w-5 h-5 text-amber-500" />
                            {plan.level === selectedPlan && (
                                <div className="absolute inset-0 bg-amber-500/20 blur-lg rounded-full" />
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">
                            Unavailable
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center group">
          <Button
            className={cn(
              "w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black px-12 py-3 rounded-2xl h-14 text-lg font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(245,158,11,0.2)]",
              buttonClassName,
            )}
            onClick={() => handlePlanSelect(selectedPlan)}
          >
            Access {plans.find((p) => p.level === selectedPlan)?.name} Protocol
            <ArrowRightIcon className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-4 text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">
            Encrypted Transaction • Instant Protocol Authorization
          </p>
        </div>
      </div>
    </div>
  )
}

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string,
): boolean {
  if (included === "starter") return true
  if (included === "pro" && (level === "pro" || level === "all")) return true
  if (included === "all" && level === "all") return true
  return false
}
