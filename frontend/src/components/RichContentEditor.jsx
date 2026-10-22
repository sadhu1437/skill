import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import { DOMParser as ProseMirrorDOMParser, Slice } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { looksLikeMarkdown, markdownToHtml } from '../utils/markdownToHtml'
import './RichContentEditor.css'

const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          const html = event.clipboardData?.getData('text/html')
          const containsFormattedHtml = /<(?:strong|b|em|i|u|h[1-6]|ul|ol|li|blockquote|pre)\b/i.test(html || '')
          if (!text || (html && containsFormattedHtml) || !looksLikeMarkdown(text)) return false

          const container = document.createElement('div')
          container.innerHTML = markdownToHtml(text)
          const parsed = ProseMirrorDOMParser.fromSchema(view.state.schema).parse(container)
          view.dispatch(view.state.tr.replaceSelection(Slice.maxOpen(parsed.content)).scrollIntoView())
          return true
        },
      },
    })]
  },
})

function getEditorContent(value) {
  const content = value || '<p></p>'
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  return !containsHtml && looksLikeMarkdown(content) ? markdownToHtml(content) : content
}

function ToolButton({ editor, label, active, action, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      className={active ? 'rich-editor-active' : ''}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => editor.chain().focus()[action]().run()}
    >
      {children}
    </button>
  )
}

export default function RichContentEditor({ value, onChange, onImageUpload, label = 'Rich content' }) {
  const fileInput = useRef(null)
  const [message, setMessage] = useState('')
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ allowBase64: false }),
      Underline,
      MarkdownPaste,
    ],
    content: getEditorContent(value),
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    const currentValue = value || '<p></p>'
    const content = getEditorContent(value)
    if (editor.getHTML() !== content) editor.commands.setContent(content, false)
    if (content !== currentValue) onChange(content)
  }, [editor, value])

  function toggleLink() {
    const selection = editor.state.selection
    if (selection.empty && !editor.isActive('link')) return
    const currentUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter a link URL', currentUrl)
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim(), target: '_blank' }).run()
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editor || !onImageUpload) return

    setMessage('')
    try {
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url, alt: file.name }).run()
    } catch (uploadError) {
      setMessage(uploadError.message || 'Image upload failed.')
    }
  }

  if (!editor) return <div className="rich-editor-loading">Loading editor...</div>

  return (
    <div className="rich-editor-shell">
      <div className="rich-editor-toolbar" role="toolbar" aria-label={label}>
        <ToolButton editor={editor} label="Bold" active={editor.isActive('bold')} action="toggleBold"><strong>B</strong></ToolButton>
        <ToolButton editor={editor} label="Italic" active={editor.isActive('italic')} action="toggleItalic"><em>I</em></ToolButton>
        <ToolButton editor={editor} label="Underline" active={editor.isActive('underline')} action="toggleUnderline"><u>U</u></ToolButton>
        <ToolButton editor={editor} label="Bullet list" active={editor.isActive('bulletList')} action="toggleBulletList">• List</ToolButton>
        <ToolButton editor={editor} label="Numbered list" active={editor.isActive('orderedList')} action="toggleOrderedList">1. List</ToolButton>
        <ToolButton editor={editor} label="Block quote" active={editor.isActive('blockquote')} action="toggleBlockquote">Quote</ToolButton>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={toggleLink}>Link</button>
        {editor.isActive('link') && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button>}
        {onImageUpload && <>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => fileInput.current?.click()}>Insert image</button>
          <input ref={fileInput} className="rich-editor-file-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadImage} aria-label="Upload image into content" />
        </>}
        <span className="rich-editor-help">Paste formatted text or Markdown here.</span>
      </div>
      {message && <p className="rich-editor-message" role="alert">{message}</p>}
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  )
}
