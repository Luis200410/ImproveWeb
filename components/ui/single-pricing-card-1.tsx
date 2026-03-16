'use client';
import React from 'react';
import { PlusIcon, ShieldCheckIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { BorderTrail } from './border-trail';

const FEATURES = [
	{ name: "Global Cognitive Dashboard", tier: "Core" },
	{ name: "Integrated Task Protocols", tier: "Core" },
	{ name: "Advanced System Analytics", tier: "Pro" },
	{ name: "Full Logic Core Access", tier: "Pro" },
	{ name: "Neural Network Integrations", tier: "Elite" },
	{ name: "Unlimited Strategic Nodes", tier: "Elite" },
	{ name: "24/7 Deepmind Protocol", tier: "Elite" },
];

export function Pricing() {
	return (
		<section className="relative overflow-hidden py-12">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-5"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border border-amber-500/20 px-4 py-1 font-mono text-amber-500 text-xs uppercase tracking-widest bg-amber-500/5">Pricing Protocol</div>
					</div>
					<h2 className="mt-5 text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl text-white">
						Investment in Excellence
					</h2>
					<p className="text-white/40 mt-5 text-center text-sm md:text-base max-w-md mx-auto">
						A singular gateway to all cognitive architectures. Integrated, limitless, performance-driven.
					</p>
				</motion.div>

				<div className="relative pt-8">
					<div
						className={cn(
							'pointer-events-none absolute inset-0 size-full opacity-20',
							'bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]',
							'bg-[size:32px_32px]',
							'[mask-image:radial-gradient(ellipse_at_center,black_10%,transparent)]',
						)}
					/>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true }}
						className="mx-auto w-full max-w-2xl space-y-2 relative z-10"
					>	
						<div className="grid md:grid-cols-2 bg-black/40 backdrop-blur-xl relative border border-white/10 p-4 rounded-2xl">
							<PlusIcon className="absolute -top-3 -left-3 size-6 text-white/20" />
							<PlusIcon className="absolute -top-3 -right-3 size-6 text-white/20" />
							<PlusIcon className="absolute -bottom-3 -left-3 size-6 text-white/20" />
							<PlusIcon className="absolute -right-3 -bottom-3 size-6 text-white/20" />

							<div className="w-full px-4 pt-5 pb-4">
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold text-white/80">Monthly</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-white/30 text-sm line-through">$19</span>
											<Badge variant="secondary" className="bg-white/5 border-white/10 text-white/60">Save 10%</Badge>
										</div>
									</div>
									<p className="text-white/40 text-sm font-light">Flexible entry to the ecosystem.</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-white/40 flex items-end gap-0.5 text-xl font-light">
										<span>$</span>
										<span className="text-white -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											17
										</span>
										<span className="text-base">/month</span>
									</div>
									<Button className="w-full border-white/20 text-white hover:bg-white/10" variant="outline" asChild>
										<a href="/login">Initialize Trial</a>
									</Button>
								</div>
							</div>
							<div className="relative w-full rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 pt-5 pb-4 overflow-hidden group">
								<BorderTrail
									style={{
										boxShadow:
											'0px 0px 40px 10px rgba(245, 158, 11, 0.4)',
									}}
									className="bg-amber-500"
									size={120}
								/>
								<div className="space-y-1 relative z-10">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold text-white">Yearly</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-white/30 text-sm line-through">$17</span>
											<Badge className="bg-amber-500 text-black border-none font-bold">Best Value</Badge>
										</div>
									</div>
									<p className="text-white/60 text-sm font-light">Full commitment to evolution.</p>
								</div>
								<div className="mt-10 space-y-4 relative z-10">
									<div className="text-white/40 flex items-end text-xl font-light">
										<span>$</span>
										<span className="text-amber-500 -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											12
										</span>
										<span className="text-base">/month</span>
									</div>
									<Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-11" asChild>
										<a href="/login">Unlock Protocol</a>
									</Button>
								</div>
							</div>
						</div>

						<div className="bg-black/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 mt-4 shadow-2xl relative overflow-hidden group">
							<div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
								<div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
								<h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">System Capabilities Matrix</h4>
							</div>
							
							<div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
								{FEATURES.map((feature, idx) => (
									<motion.div 
										key={feature.name}
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.1 + (idx * 0.05) }}
										className="flex items-center gap-3 group/item"
									>
										<div className="flex-shrink-0">
											<CheckCircle2 className="size-4 text-amber-500/80 group-hover/item:text-amber-400 transition-colors" />
										</div>
										<span className="text-sm text-white/70 group-hover/item:text-white transition-colors font-light tracking-wide">{feature.name}</span>
										{feature.tier === "Elite" && (
											<div className="ml-auto">
												<Badge className="h-4 px-1 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase font-black tracking-tighter">Elite</Badge>
											</div>
										)}
									</motion.div>
								))}
							</div>

							<div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
								<PlusIcon className="size-20 text-white" />
							</div>
						</div>

						<div className="text-white/30 flex items-center justify-center gap-x-2 text-[10px] uppercase tracking-[0.2em] pt-8 font-mono">
							<ShieldCheckIcon className="size-3 text-amber-500/50" />
							<span>Encrypted Access • No Hidden Protocols</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
