'use client'

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { User, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

import { signup } from '@/app/login/actions'

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="register-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#register-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="h-20" />

                <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-md"
                    >
                        {/* Header */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center gap-2 mb-6"
                            >
                                <Sparkles className="w-5 h-5 text-white/60" />
                                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Join the Elite</p>
                                <Sparkles className="w-5 h-5 text-white/60" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`${playfair.className} text-5xl md:text-6xl font-bold mb-4 text-white`}
                            >
                                Begin Your Journey
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`${inter.className} text-white/60`}
                            >
                                Create your account and join those committed to excellence
                            </motion.p>
                        </div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative"
                        >
                            {/* Glowing border effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/5 to-white/20 blur opacity-50" />

                            <form className="relative bg-black/50 backdrop-blur-xl border border-white/10 p-8 space-y-6">
                                {/* Name Field */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-2"
                                >
                                    <label className={`${inter.className} text-sm text-white/60 uppercase tracking-wider flex items-center gap-2`}>
                                        <User className="w-4 h-4" />
                                        Full Name
                                    </label>
                                    <input
                                        id="full_name"
                                        name="full_name"
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </motion.div>

                                {/* Email Field */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <label className={`${inter.className} text-sm text-white/60 uppercase tracking-wider flex items-center gap-2`}>
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </motion.div>

                                {/* Password Field */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-2"
                                >
                                    <label className={`${inter.className} text-sm text-white/60 uppercase tracking-wider flex items-center gap-2`}>
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                                        placeholder="Create a strong password"
                                        required
                                    />
                                </motion.div>

                                {/* Confirm Password Field */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="space-y-2"
                                >
                                    <label className={`${inter.className} text-sm text-white/60 uppercase tracking-wider flex items-center gap-2`}>
                                        <Lock className="w-4 h-4" />
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1 }}
                                >
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            formAction={signup}
                                            className="w-full bg-white text-black hover:bg-white/90 font-serif text-sm uppercase tracking-widest py-6 relative overflow-hidden group"
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                initial={{ x: "-100%" }}
                                                whileHover={{ x: "100%" }}
                                                transition={{ duration: 0.6 }}
                                            />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Create Account
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </Button>
                                    </motion.div>
                                </motion.div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black px-2 text-white/40 tracking-wider">Or</span>
                                    </div>
                                </div>

                                {/* Login Link */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.1 }}
                                    className="text-center"
                                >
                                    <p className={`${inter.className} text-sm text-white/60`}>
                                        Already a member?{" "}
                                        <Link href="/login" className="text-white hover:text-white/80 transition-colors font-medium">
                                            Sign in here
                                        </Link>
                                    </p>
                                </motion.div>
                            </form>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-8 text-center space-y-2"
                        >
                            <p className={`${inter.className} text-xs text-white/40`}>
                                By creating an account, you agree to our Terms of Service
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xs text-white/30">
                                <span>🔒 Secure & Encrypted</span>
                                <span>•</span>
                                <span>✓ No Spam</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
