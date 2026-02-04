'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'
import { SlashCommand } from './slash-command'
import {
    Bold, Italic, Code, List, ListOrdered, Quote,
    Image as ImageIcon, Undo, Redo, Terminal
} from 'lucide-react'

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
                codeBlock: false, // Disable default code block to use lowlight
            }),
            Image,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            SlashCommand,
        ],
        content: initialContent,
        editable,
        attributes: {
            class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] prose-headings:font-serif prose-headings:font-normal prose-headings:text-white prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8 prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-amber-500/80 prose-p:text-white/80 prose-p:leading-relaxed prose-p:font-light prose-strong:text-amber-500 prose-strong:font-bold prose-code:text-emerald-400 prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-blockquote:border-l-2 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/60 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-img:rounded-lg prose-img:border prose-img:border-white/10',
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

            {/* Toolbar (Visible when editable) */}
            {editable && (
                <div className="sticky top-0 z-50 mb-4 flex flex-wrap gap-2 p-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-lg">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-2 rounded hover:bg-white/5 text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        H1
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded hover:bg-white/5 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        H2
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-white/5 ${editor.isActive('bulletList') ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-white/5 ${editor.isActive('orderedList') ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-white/5 ${editor.isActive('blockquote') ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`p-2 rounded hover:bg-white/5 ${editor.isActive('codeBlock') ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        <Terminal className="w-4 h-4" />
                    </button>
                    <button
                        onClick={addImage}
                        className="p-2 rounded hover:bg-white/5 text-white/40 hover:text-white"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <div className="ml-auto flex gap-1">
                        <button onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-white/5 text-white/40">
                            <Undo className="w-4 h-4" />
                        </button>
                        <button onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-white/5 text-white/40">
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    )
}
