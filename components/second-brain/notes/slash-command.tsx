'use client'

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Editor, Range } from '@tiptap/react'
import tippy from 'tippy.js'
import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    Code,
    ImageIcon,
    Quote,
    Type,
    CheckSquare
} from 'lucide-react'

// --- Command List Component ---

interface CommandItemProps {
    title: string
    icon: React.ElementType
    description: string
    command: (props: { editor: Editor; range: Range }) => void
}

const CommandList = forwardRef((props: {
    items: CommandItemProps[]
    command: any
    editor: any
    range: any
}, ref) => {
    const { items, command, editor, range } = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    
    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(0)
    }, [items])

    const selectItem = (index: number) => {
        const item = items[index]
        if (item) {
            command(item)
        }
    }

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + items.length - 1) % items.length)
                return true
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % items.length)
                return true
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex)
                return true
            }
            return false
        },
    }), [items, selectedIndex, command]) // important dependencies


    // We need to listen to keydown events from the editor to drive the menu
    // The `suggestion` plugin handles this by calling `onKeyDown` in its renderer options.
    // However, that function needs access to `selectedIndex` state which is inside this React component.
    // We'll solve this by using useImperativeHandle logic or a ref in the render function (see below).
    // ACTUALLY: The standard way is that the `render` function in `suggestion` creates a ReactRenderer,
    // and we can pass a `ref` to it to call methods.

    return (
        <div className="bg-[#0A0A0A]/95 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl min-w-[280px] p-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono border-b border-white/5 mb-2 flex items-center justify-between">
                <span>Neural_Matrix_Commands</span>
                <span className="bg-amber-500/10 text-amber-500/50 px-1.5 py-0.5 rounded">INTEL_DRIVEN</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar space-y-0.5">
                {items.map((item, index) => (
                    <button
                        key={index}
                        className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all duration-200 group/item ${
                            index === selectedIndex ? 'bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' : 'hover:bg-white/[0.03]'
                        }`}
                        onClick={() => selectItem(index)}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            index === selectedIndex ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-white/40 group-hover/item:text-white/60'
                        }`}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-[11px] font-bold uppercase tracking-wider ${index === selectedIndex ? 'text-white' : 'text-white/70'}`}>
                                {item.title}
                            </div>
                            <div className="text-[9px] uppercase tracking-wide opacity-40 font-mono line-clamp-1">{item.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
})

CommandList.displayName = 'CommandList'

// --- Command Suggestions Definition ---

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            description: 'Just start typing with plain text.',
            icon: Type,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run()
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            icon: Heading1,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            icon: Heading2,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            icon: Heading3,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
            },
        },
        {
            title: 'Heading 4',
            description: 'Subsection heading.',
            icon: Heading4,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run()
            },
        },
        {
            title: 'Heading 5',
            description: 'Small subsection heading.',
            icon: Heading5,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 5 }).run()
            },
        },
        {
            title: 'Heading 6',
            description: 'Smallest heading.',
            icon: Heading6,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 6 }).run()
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bulleted list.',
            icon: List,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            icon: ListOrdered,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: 'Todo List',
            description: 'Track tasks with a checklist.',
            icon: CheckSquare,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run()
            },
        },
        {
            title: 'Blockquote',
            description: 'Capture a quote.',
            icon: Quote,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
            },
        },
        {
            title: 'Code Block',
            description: 'Capture a code snippet.',
            icon: Code,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
            },
        },
        {
            title: 'Image',
            description: 'Embed an image from a URL.',
            icon: ImageIcon,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                editor.chain().focus().deleteRange(range).run()
                window.dispatchEvent(new CustomEvent('neural-editor-add-image', { detail: { editor } }))
            },
        },
    ].filter((item) => {
        if (!query) return true
        return item.title.toLowerCase().includes(query.toLowerCase()) || 
               item.description.toLowerCase().includes(query.toLowerCase())
    })
}

// --- Render Logic ---

import { ReactRenderer } from '@tiptap/react'

const renderSuggestion = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            })

            // Create a wrapper for tippy to attach to
            const getReferenceClientRect = props.clientRect

            popup = tippy('body', {
                getReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            })
        },

        onUpdate(props: any) {
            component?.updateProps(props)

            if (!props.clientRect) {
                return
            }

            popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
            })
        },

        onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
                popup?.[0].hide()
                return true
            }

            return (component?.ref as any)?.onKeyDown(props)
        },

        onExit() {
            popup?.[0].destroy()
            component?.destroy()
        },
    }
}

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
}).configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderSuggestion,
    },
})
