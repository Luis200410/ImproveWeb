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
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 rounded px-3 py-1.5 transition-colors focus:outline-none focus:border-amber-500/50 group">
                    <Folder className="w-3 h-3 text-white/40 group-hover:text-amber-500 transition-colors" />
                    <span className="max-w-[150px] truncate">
                        {selectedProject ? (selectedProject.data.title || 'Untitled Project') : 'ALL PROJECTS'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/30" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0A0A0A] border-white/10 text-white/70" align="end">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
                    Filter View
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuRadioGroup value={selectedProjectId || ''} onValueChange={(val) => onSelectProject(val || null)}>
                    <DropdownMenuRadioItem
                        value=""
                        className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                    >
                        ALL PROJECTS
                    </DropdownMenuRadioItem>
                    {projects.map(p => (
                        <DropdownMenuRadioItem
                            key={p.id}
                            value={p.id}
                            className="text-xs focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                            {p.data.title || 'Untitled Project'}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
