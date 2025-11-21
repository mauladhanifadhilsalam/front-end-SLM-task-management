"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  IconBold,
  IconItalic,
  IconHeading,
  IconCode,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconListCheck,
} from "@tabler/icons-react"

type Command =
  | "bold"
  | "italic"
  | "heading"
  | "code"
  | "ul"
  | "ol"
  | "quote"
  | "link"
  | "task"

type MarkdownEditorProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  helperText,
  error,
  disabled,
  placeholder,
}: MarkdownEditorProps) {
  const [mode, setMode] = React.useState<"write" | "preview">("write")
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const applyCommand = (cmd: Command) => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus()

    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const current = textarea.value ?? ""
    const selected = current.slice(start, end)

    let insert = ""

    switch (cmd) {
      case "bold":
        insert = `**${selected || "bold text"}**`
        break
      case "italic":
        insert = `*${selected || "italic text"}*`
        break
      case "heading":
        insert = `## ${selected || "Heading"}`
        break
      case "code":
        if (selected.includes("\n")) {
          insert = `\n\`\`\`\n${selected || "code"}\n\`\`\`\n`
        } else {
          insert = `\`${selected || "code"}\``
        }
        break
      case "ul":
        insert = `- ${selected || "list item"}`
        break
      case "ol":
        insert = `1. ${selected || "list item"}`
        break
      case "task":
        insert = `- [ ] ${selected || "task item"}`
        break
      case "quote":
        insert = `> ${selected || "quote"}`
        break
      case "link":
        insert = `[${selected || "link text"}](https://example.com)`
        break
    }

    // pakai native API biar masuk ke undo stack (Ctrl+Z jalan)
    textarea.setRangeText(insert, start, end, "end")

    const newValue = textarea.value
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return

    const textarea = e.currentTarget
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0

    // kalau lagi select banyak text, biarin native behavior
    if (start !== end) return

    const valueNow = textarea.value
    const before = valueNow.slice(0, start)
    const after = valueNow.slice(end)

    const lastBreak = before.lastIndexOf("\n")
    const lineStart = lastBreak === -1 ? 0 : lastBreak + 1
    const currentLine = before.slice(lineStart)

    // bullet list: "- " / "* " / "+ "
    const bulletMatch = currentLine.match(/^(\s*[-*+] )(.+)?$/)
    // ordered list: "1. " / "2. " etc
    const numberMatch = currentLine.match(/^(\s*)(\d+)\. (.*)?$/)

    // kalau line cuma marker doang (misal: "- " lalu Enter) → keluar dari list
    if (
      bulletMatch &&
      (!bulletMatch[2] || bulletMatch[2].trim().length === 0)
    ) {
      e.preventDefault()
      // hapus marker, ganti jadi baris kosong
      const replace = "\n"
      textarea.setRangeText(replace, lineStart, start, "end")
      onChange(textarea.value)
      return
    }

    if (
      numberMatch &&
      (!numberMatch[3] || numberMatch[3].trim().length === 0)
    ) {
      e.preventDefault()
      const replace = "\n"
      textarea.setRangeText(replace, lineStart, start, "end")
      onChange(textarea.value)
      return
    }

    if (bulletMatch) {
      e.preventDefault()
      const prefix = bulletMatch[1] // termasuk "- "
      const insert = `\n${prefix}`
      textarea.setRangeText(insert, start, end, "end")
      onChange(textarea.value)
      return
    }

    if (numberMatch) {
      e.preventDefault()
      const indent = numberMatch[1] || ""
      const currentNum = parseInt(numberMatch[2], 10)
      const nextNum = isNaN(currentNum) ? 1 : currentNum + 1
      const insert = `\n${indent}${nextNum}. `
      textarea.setRangeText(insert, start, end, "end")
      onChange(textarea.value)
      return
    }

    // kalau bukan list → biarin default
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {label && <Label>{label}</Label>}

        <div className="inline-flex items-center rounded-md border bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={
              "px-2 py-1 rounded-sm font-medium " +
              (mode === "write"
                ? "bg-background shadow-sm"
                : "text-muted-foreground")
            }
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={
              "px-2 py-1 rounded-sm font-medium " +
              (mode === "preview"
                ? "bg-background shadow-sm"
                : "text-muted-foreground")
            }
          >
            Preview
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {mode === "write" ? (
        <div className="rounded-md border bg-background">
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("heading")}
              title="Heading (##)"
            >
              <IconHeading className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("bold")}
              title="Bold (**text**)"
            >
              <IconBold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("italic")}
              title="Italic (*text*)"
            >
              <IconItalic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("code")}
              title="Code (`code` / ```)"
            >
              <IconCode className="h-4 w-4" />
            </Button>

            <div className="mx-1 h-5 w-px bg-border" />

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("ul")}
              title="Bulleted list (-)"
            >
              <IconList className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("ol")}
              title="Numbered list (1.)"
            >
              <IconListNumbers className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("task")}
              title="Task list (- [ ])"
            >
              <IconListCheck className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("quote")}
              title="Quote (>)"
            >
              <IconQuote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => applyCommand("link")}
              title="Link ([text](url))"
            >
              <IconLink className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      ) : (
        <div className="min-h-[150px] rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {value.trim() ? (
            <div className="markdown-body !bg-transparent !text-[14px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nothing to preview. Tulis dulu di tab{" "}
              <span className="font-semibold">Write</span>.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
