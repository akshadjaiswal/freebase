"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import {
  Bold,
  Italic,
  Code,
  Link2,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";

interface TiptapEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlock extension
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-[var(--accent)]" } }),
      CodeBlock.configure({ HTMLAttributes: { class: "tiptap-code-block" } }),
    ],
    content: Object.keys(content).length > 0 ? content : undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius)] transition-colors ${
        active
          ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] p-2">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code size={14} />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-[var(--border)]" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-[var(--border)]" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Minus size={14} />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-[var(--border)]" />

        <ToolbarBtn
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (!url) return;
            editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Link"
        >
          <Link2 size={14} />
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
