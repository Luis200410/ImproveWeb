'use client'

import React from 'react'
import { Check, ChevronDown, Folder } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Entry } from '@/lib/data-store'
import { cn } from '@/lib/utils'

interface ProjectFilterDropdownProps {
    projects: Entry[]
    selectedProjectId: string | null
    onSelectProject: (id: string | null) => void
}

export function ProjectFilterDropdown({ projects, selectedProjectId, onSelectProject }: ProjectFilterDropdownProps) {
    const selectedProject = projects.find(p => p.id === selectedProjectId)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 bg-[#050505] border border-white/10 hover:border-white/20 px-5 py-2 rounded-lg transition-all focus:outline-none group">
                    <Folder className="w-3 h-3 text-white/40 group-hover:text-amber-500 transition-colors" />
                    <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-white/70 group-hover:text-white max-w-[150px] truncate">
                        {selectedProject ? (selectedProject.data.title || 'Untitled Project') : 'ALL PROJECTS'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-[280px] bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 p-2 rounded-xl" 
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel className="px-3 py-2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                    Filter View
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-white/5 mx-1" />
                
                <div className="space-y-1 mt-1">
                    <DropdownMenuItem
                        onClick={() => onSelectProject(null)}
                        className={`
                            relative flex items-center px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all
                            ${!selectedProjectId
                                ? 'bg-white/5 text-white'
                                : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                            }
                        `}
                    >
                        {!selectedProjectId && (
                            <div className="absolute left-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                        )}
                        <span className="pl-1">ALL PROJECTS</span>
                    </DropdownMenuItem>

                    {projects.map(p => (
                        <DropdownMenuItem
                            key={p.id}
                            onClick={() => onSelectProject(p.id)}
                            className={`
                                relative flex items-center px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all
                                ${selectedProjectId === p.id
                                    ? 'bg-white/5 text-white'
                                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                                }
                            `}
                        >
                            {selectedProjectId === p.id && (
                                <div className="absolute left-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                            )}
                            <span className="pl-1 truncate">{p.data.title || 'Untitled Project'}</span>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
