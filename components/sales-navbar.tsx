"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { Activity, Shield, Zap, Target, Brain, Heart, Briefcase, Sparkles } from "lucide-react";

export function SalesNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-[100]", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Systems">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="#body" className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Body Protocol
            </HoveredLink>
            <HoveredLink href="#money" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Wealth Architecture
            </HoveredLink>
            <HoveredLink href="#productivity" className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> High Performance
            </HoveredLink>
            <HoveredLink href="#mind-emotions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" /> Cognitive Sovereignty
            </HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Core Logic">
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Bio-Sync"
              href="#"
              src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop"
              description="Real-time biometric integration for peak recovery."
            />
            <ProductItem
              title="Capital Velocity"
              href="#"
              src="https://images.unsplash.com/photo-1611974714014-4b50ca4314c4?q=80&w=2070&auto=format&fit=crop"
              description="Strategic asset allocation and yield optimization."
            />
            <ProductItem
              title="Deep Work Engine"
              href="#"
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"
              description="Eliminating cognitive load for maximum focus."
            />
            <ProductItem
              title="Second Brain"
              href="#"
              src="https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=2030&auto=format&fit=crop"
              description="Compound interest for your ideas and knowledge."
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Membership">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/pricing" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Level One: Sentinel
            </HoveredLink>
            <HoveredLink href="/pricing" className="flex items-center gap-2">
               Level Two: Archon
            </HoveredLink>
            <HoveredLink href="/pricing" className="flex items-center gap-2">
               Level Three: Sovereign
            </HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
