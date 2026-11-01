import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import { DOMParser as ProseMirrorDOMParser, Slice } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { isSafeLinkUrl, looksLikeMarkdown, markdownToHtml } from '../utils/markdownToHtml'
import { sanitizeHtml } from '../security/sanitizeHtml'
import './RichContentEditor.css'

function normalizeClipboardHtml(html) {
  const container = document.createElement('template')
  container.innerHTML = html
  container.content.querySelectorAll('script, style, iframe, object, embed').forEach((element) => element.remove())

  container.content.querySelectorAll('[style]').forEach((element) => {
    const style = element.style
    const wrappers = []
    const fontWeight = style.fontWeight
    if (fontWeight === 'bold' || fontWeight === 'bolder' || Number(fontWeight) >= 600) wrappers.push('strong')
    if (style.fontStyle === 'italic' || style.fontStyle === 'oblique') wrappers.push('em')
    const decoration = `${style.textDecoration} ${style.textDecorationLine}`
    if (/\bunderline\b/i.test(decoration)) wrappers.push('u')
    if (/\bline-through\b/i.test(decoration)) wrappers.push('s')

    let content = element
    wrappers.forEach((tag) => {
      const wrapper = document.createElement(tag)
      content.replaceWith(wrapper)
      wrapper.append(content)
      content = wrapper
    })
    element.removeAttribute('style')
  })

  return sanitizeHtml(container.innerHTML)
}

const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          const html = event.clipboardData?.getData('text/html')
          const containsFormattedHtml = /<(?:strong|b|em|i|u|s|del|h[1-6]|ul|ol|li|blockquote|pre|code|a|hr)\b/i.test(html || '')
            || /style\s*=\s*["'][^"']*(?:font-weight|font-style|text-decoration)/i.test(html || '')
          if (html && containsFormattedHtml) {
            const container = document.createElement('div')
            container.innerHTML = normalizeClipboardHtml(html)
            const parsed = ProseMirrorDOMParser.fromSchema(view.state.schema).parse(container)
            view.dispatch(view.state.tr.replaceSelection(Slice.maxOpen(parsed.content)).scrollIntoView())
            return true
          }
          if (!text || !looksLikeMarkdown(text)) return false

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
  const [preview, setPreview] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ['http', 'https'],
        isAllowedUri: (url, { defaultValidate }) => isSafeLinkUrl(url) && defaultValidate(url),
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image.configure({ allowBase64: false }),
      Underline,
      MarkdownPaste,
    ],
    content: getEditorContent(value),
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })
  const formatting = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      underline: current?.isActive('underline') ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
      blockquote: current?.isActive('blockquote') ?? false,
      link: current?.isActive('link') ?? false,
    }),
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
    if (!isSafeLinkUrl(url)) {
      setMessage('Enter a safe http, https, or relative link.')
      return
    }
    setMessage('')
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim(), target: '_blank', rel: 'noopener noreferrer' }).run()
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
        <button type="button" aria-pressed={!preview} className={!preview ? 'rich-editor-active' : ''} onClick={() => setPreview(false)}>Edit</button>
        <button type="button" aria-pressed={preview} className={preview ? 'rich-editor-active' : ''} onClick={() => setPreview(true)}>Preview</button>
        <ToolButton editor={editor} label="Bold" active={formatting?.bold} action="toggleBold"><strong>B</strong></ToolButton>
        <ToolButton editor={editor} label="Italic" active={formatting?.italic} action="toggleItalic"><em>I</em></ToolButton>
        <ToolButton editor={editor} label="Underline" active={formatting?.underline} action="toggleUnderline"><u>U</u></ToolButton>
        <ToolButton editor={editor} label="Bullet list" active={formatting?.bulletList} action="toggleBulletList">• List</ToolButton>
        <ToolButton editor={editor} label="Numbered list" active={formatting?.orderedList} action="toggleOrderedList">1. List</ToolButton>
        <ToolButton editor={editor} label="Block quote" active={formatting?.blockquote} action="toggleBlockquote">Quote</ToolButton>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={toggleLink}>Link</button>
        {formatting?.link && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button>}
        {onImageUpload && <>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => fileInput.current?.click()}>Insert image</button>
          <input ref={fileInput} className="rich-editor-file-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadImage} aria-label="Upload image into content" />
        </>}
        <span className="rich-editor-help">Paste formatted text or Markdown here.</span>
      </div>
      {message && <p className="rich-editor-message" role="alert">{message}</p>}
      {preview
        ? <div className="rich-editor-preview rich-content-rendered" aria-label={`${label} preview`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />
        : <EditorContent editor={editor} className="rich-editor-content" />}
    </div>
  )
}
