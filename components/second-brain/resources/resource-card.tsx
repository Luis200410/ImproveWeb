'use client'

import { motion } from 'framer-motion'
import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, Video } from 'lucide-react'
import { Entry } from '@/lib/data-store'

interface ResourceCardProps {
    resource: Entry
    onClick: () => void
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
    const type = resource.data.type || 'link'
    const url = resource.data.url

    const getIcon = () => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />
            case 'image': return <ImageIcon className="w-4 h-4" />
            case 'file': return <FileText className="w-4 h-4" />
            default: return <LinkIcon className="w-4 h-4" />
        }
    }

    return (
        <motion.div
            layoutId={resource.id}
            onClick={onClick}
            className="group relative bg-[#0A0A0A] border border-white/5 hover:border-blue-500/30 rounded-lg p-4 cursor-pointer transition-all"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white/90 group-hover:text-blue-400 transition-colors truncate">
                        {resource.data.title || 'Untitled Resource'}
                    </h4>
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 mt-1 truncate"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3 h-3" />
                            {new URL(url).hostname.replace('www.', '')}
                        </a>
                    )}
                </div>
                <div className="text-white/20 group-hover:text-blue-500 transition-colors">
                    {getIcon()}
                </div>
            </div>
        </motion.div>
    )
}
