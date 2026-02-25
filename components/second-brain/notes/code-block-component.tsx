import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import React from 'react'

export const CodeBlockComponent = ({
    node,
    updateAttributes,
    extension,
}: NodeViewProps) => {
    const defaultLanguage = node.attrs.language;
    // List of common languages for the dropdown to avoid an excessively long list
    const languages = [
        { label: 'Auto', value: 'null' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'Python', value: 'python' },
        { label: 'Bash', value: 'bash' },
        { label: 'SQL', value: 'sql' },
        { label: 'JSON', value: 'json' },
    ]

    return (
        <NodeViewWrapper className="relative code-block group my-4 rounded-lg border border-white/10 bg-[#111] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Code Snippet</span>
                <select
                    contentEditable={false}
                    defaultValue={defaultLanguage || 'null'}
                    onChange={event => updateAttributes({ language: event.target.value === 'null' ? null : event.target.value })}
                    className="bg-[#1A1A1A] text-white/60 border border-white/10 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50 hover:bg-white/10 transition-colors"
                >
                    {languages.map((lang, index) => (
                        <option key={index} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                    <option disabled>—</option>
                    {/* Optionally list all lowlight languages, but it's overwhelming. We stick to the common ones. */}
                    {extension.options.lowlight.listLanguages().filter((l: string) => !languages.find(pl => pl.value === l)).map((lang: string, index: number) => (
                        <option key={`ext-${index}`} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>
            </div>
            <pre className="!mt-0 !bg-transparent !border-0 !m-0 p-4 overflow-x-auto text-[13px] font-mono leading-relaxed">
                <NodeViewContent />
            </pre>
        </NodeViewWrapper>
    )
}
