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
		<section className="relative overflow-hidden py-12 bg-[var(--bg)] text-[var(--label)]">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-3 text-center"
				>
					<div className="flex justify-center">
						<span className="kicker text-[var(--indigo)] bg-[var(--fill)] px-4 py-1 rounded-full">Pricing Protocol</span>
					</div>
					<h2 className="type-large-title text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl text-[var(--label)]">
						Investment in Excellence
					</h2>
					<p className="type-body text-[var(--label-2)] max-w-md mx-auto">
						A singular gateway to all cognitive architectures. Integrated, limitless, performance-driven.
					</p>
				</motion.div>

				<div className="relative pt-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true }}
						className="mx-auto w-full max-w-2xl space-y-4 relative z-10"
					>	
						<div className="grid md:grid-cols-2 bg-[var(--card)] relative border border-[var(--separator)] p-4 rounded-[20px] shadow-[var(--card-shadow)]">
							<div className="w-full px-4 pt-5 pb-4">
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="type-headline text-[var(--label)]">Monthly</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-[var(--label-3)] text-sm line-through font-rounded">$19</span>
											<span className="tag-chip text-xs">Save 10%</span>
										</div>
									</div>
									<p className="type-caption text-[var(--label-2)]">Flexible entry to the ecosystem.</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-[var(--label-2)] flex items-end gap-0.5 text-xl font-light">
										<span>$</span>
										<span className="font-rounded text-[var(--label)] -mb-0.5 text-4xl font-extrabold md:text-5xl">
											17
										</span>
										<span className="type-caption text-[var(--label-2)] mb-1">/month</span>
									</div>
									<a href="/login" className="btn-secondary w-full text-center">
										Initialize Trial
									</a>
								</div>
							</div>

							<div className="relative w-full rounded-[14px] border border-[var(--indigo)] bg-[var(--card-inset)] px-4 pt-5 pb-4 overflow-hidden group">
								<BorderTrail
									style={{
										boxShadow:
											'0px 0px 40px 10px rgba(94, 92, 230, 0.4)',
									}}
									className="bg-[var(--indigo)]"
									size={120}
								/>
								<div className="space-y-1 relative z-10">
									<div className="flex items-center justify-between">
										<h3 className="type-headline text-[var(--label)]">Yearly</h3>
										<div className="flex items-center gap-x-1">
											<span className="text-[var(--label-3)] text-sm line-through font-rounded">$17</span>
											<span className="tag-chip text-xs bg-[var(--indigo)] text-white font-bold">Best Value</span>
										</div>
									</div>
									<p className="type-caption text-[var(--label-2)]">Full commitment to evolution.</p>
								</div>
								<div className="mt-10 space-y-4 relative z-10">
									<div className="text-[var(--label-2)] flex items-end text-xl font-light">
										<span>$</span>
										<span className="font-rounded text-[var(--indigo)] -mb-0.5 text-4xl font-extrabold md:text-5xl">
											12
										</span>
										<span className="type-caption text-[var(--label-2)] mb-1">/month</span>
									</div>
									<a href="/login" className="btn-primary w-full text-center">
										Unlock Protocol
									</a>
								</div>
							</div>
						</div>

						<div className="bg-[var(--card)] border border-[var(--separator)] rounded-[20px] p-6 shadow-[var(--card-shadow)] relative overflow-hidden">
							<div className="flex items-center gap-2 mb-6 border-b border-[var(--separator)] pb-4">
								<div className="h-2 w-2 rounded-full bg-[var(--indigo)] animate-pulse" />
								<h4 className="kicker">System Capabilities Matrix</h4>
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
											<CheckCircle2 className="size-4 text-[var(--indigo)]" />
										</div>
										<span className="type-body text-[var(--label)] group-hover/item:text-[var(--indigo)] transition-colors">{feature.name}</span>
										{feature.tier === "Elite" && (
											<div className="ml-auto">
												<span className="tag-chip text-[9px] text-[var(--indigo)] uppercase font-bold">Elite</span>
											</div>
										)}
									</motion.div>
								))}
							</div>
						</div>

						<div className="text-[var(--label-3)] flex items-center justify-center gap-x-2 type-subcaption pt-8">
							<ShieldCheckIcon className="size-3 text-[var(--indigo)]" />
							<span>Encrypted Access • No Hidden Protocols</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
