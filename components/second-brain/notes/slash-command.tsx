'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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

const CommandList = ({
    items,
    command,
    editor,
    range,
}: {
    items: CommandItemProps[]
    command: any
    editor: any
    range: any
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = useCallback(
        (index: number) => {
            const item = items[index]
            if (item) {
                command(item)
            }
        },
        [command, items]
    )

    useEffect(() => {
        const navigationHandler = () => {
            return {
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
            }
        }
        // This is a bit of a hack to expose the handler to the tiptap render function
        // In a real plugin, we'd pass this via props or context properly, 
        // but tiptap suggestion render is imperative.
        // We'll attach it to the DOM element for now or just rely on the ref passed to the renderer.
        (window as any)._slashCommandKeyHandler = navigationHandler().onKeyDown
        return () => {
            delete (window as any)._slashCommandKeyHandler
        }
    }, [items, selectedIndex, selectItem])

    // We need to listen to keydown events from the editor to drive the menu
    // The `suggestion` plugin handles this by calling `onKeyDown` in its renderer options.
    // However, that function needs access to `selectedIndex` state which is inside this React component.
    // We'll solve this by using useImperativeHandle logic or a ref in the render function (see below).
    // ACTUALLY: The standard way is that the `render` function in `suggestion` creates a ReactRenderer,
    // and we can pass a `ref` to it to call methods.

    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[300px] p-1">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-white/30 font-mono border-b border-white/5 mb-1">
                Neural Commands
            </div>
            {items.map((item, index) => (
                <button
                    key={index}
                    className={`flex items-center gap-3 w-full p-2 rounded text-left transition-colors ${index === selectedIndex ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-white/5 text-white/60'
                        }`}
                    onClick={() => selectItem(index)}
                >
                    <div className={`p-1 rounded ${index === selectedIndex ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                        <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                        <div className={`text-sm font-medium ${index === selectedIndex ? 'text-white' : ''}`}>
                            {item.title}
                        </div>
                        <div className="text-xs opacity-50">{item.description}</div>
                    </div>
                </button>
            ))}
        </div>
    )
}

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
            description: 'Track tasks with a todo list.',
            icon: CheckSquare,
            command: ({ editor, range }: { editor: Editor; range: Range }) => {
                // Requires TaskList extension if not already present
                editor.chain().focus().deleteRange(range).toggleTaskList?.().run?.()
                // Fallback if TaskList is not installed is tricky, but starter-kit usually doesn't create it.
                // We'll stick to what we have or add it. Let's assume standard lists for now if it fails.
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
                const url = window.prompt('Image URL')
                if (url) {
                    editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
                }
            },
        },
    ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
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
            // Forward key events to the React component
            if ((window as any)._slashCommandKeyHandler) {
                return (window as any)._slashCommandKeyHandler(props)
            }

            // Fallback navigation if ref approach failed (or use ref ref.current.onKeyDown)
            if (props.event.key === 'Escape') {
                popup?.[0].hide()
                return true
            }
            return false
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
