'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CodeBlockComponent } from './code-block-component'
import { useEffect } from 'react'
import { SlashCommand } from './slash-command'

// Setup lowlight for syntax highlighting
const lowlight = createLowlight(common)

interface NeuralEditorProps {
    initialContent: string
    onChange: (content: string) => void
    editable?: boolean
}

export function NeuralEditor({ initialContent, onChange, editable = true }: NeuralEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default code block to use lowlight instead
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Image,
            CodeBlockLowlight.configure({
                lowlight,
            }).extend({
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent)
                },
            }),
            SlashCommand,
        ],
        content: initialContent,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] prose-headings:font-serif prose-headings:font-normal prose-headings:text-white prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-10 prose-h1:tracking-tight prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-5 prose-h2:mt-8 prose-h2:text-amber-500 prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-4 prose-h3:mt-6 prose-h3:text-emerald-400 prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:text-white/90 prose-h5:text-sm prose-h5:font-bold prose-h5:mb-2 prose-h5:mt-4 prose-h5:text-white/60 prose-h5:uppercase prose-h5:tracking-wider prose-h6:text-[11px] prose-h6:font-bold prose-h6:mb-2 prose-h6:mt-4 prose-h6:text-purple-400/80 prose-h6:uppercase prose-h6:tracking-[0.2em] prose-p:text-base prose-p:text-white/80 prose-p:leading-relaxed prose-p:font-light prose-strong:text-amber-500 prose-strong:font-bold prose-code:text-emerald-400 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-2 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/60 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-img:rounded-lg prose-img:border prose-img:border-white/10',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    // Update content if initialContent changes externally (e.g. loading new note)
    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            // Only update if content is significantly different to avoid cursor jumps
            // Simple check: if editor is empty and initialContent has stuff
            if (editor.isEmpty && initialContent) {
                editor.commands.setContent(initialContent)
            }
        }
    }, [initialContent, editor])

    // Update editable state
    useEffect(() => {
        editor?.setEditable(editable)
    }, [editable, editor])

    if (!editor) {
        return null
    }

    const addImage = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="neural-editor-wrapper group relative">
            {/* Hint for slash commands */}
            {editable && editor.isEmpty && (
                <div className="absolute top-0 left-0 text-white/20 pointer-events-none font-light italic">
                    Type '/' for commands...
                </div>
            )}

            {/* Custom CSS to hide the placeholder if it has focus but is empty, though tiptap handles this.
                The visual hint below is just an absolute positioned hint that goes away when typing starts. */}

            <EditorContent editor={editor} />
        </div>
    )
}
