import * as React from "react"
import { useImperativeHandle } from "react"
import { Textarea } from "./ui/textarea"

export type ExpandableTextareaRef = {
  resetHeight: () => void
  focus: () => void
} | null

export function ExpandableTextarea({
  ref,
  defaultValue,
  onSubmitMobile,
  onChangeValue,
  onArrowUp,
  onEscape,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "ref"> & {
  ref?: React.RefObject<ExpandableTextareaRef>
  onChangeValue?: (value: string) => void
  onSubmitMobile?: () => void
  onArrowUp?: () => void
  onEscape?: () => void
}) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    adjustHeight()

    textAreaRef.current?.focus()
    textAreaRef.current?.setSelectionRange(textAreaRef.current.value.length, textAreaRef.current.value.length)
  }, [])

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 2}px`
    }
  }

  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        if (textAreaRef.current) {
          textAreaRef.current.focus()
        }
      },
      resetHeight: () => {
        if (textAreaRef.current) {
          textAreaRef.current.style.height = "auto"
        }
      },
    }
  }, [])

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeValue?.(event.target.value)
    adjustHeight()
  }
  return (
    <textarea
      ref={textAreaRef}
      rows={1}
      className="field-sizing-content flex max-h-[50svh] min-h-9 w-full resize-none rounded-md border border-input bg-transparent px-3 py-1.5 text-base leading-5 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
      {...props}
      onChange={handleInput}
      onKeyDown={(event) => {
        const target = event.target as HTMLTextAreaElement
        const { selectionStart, selectionEnd, value } = target

        // Helper function to wrap selected text with markdown
        const wrapText = (wrapper: string) => {
          event.preventDefault()
          event.stopPropagation()

          const selectedText = value.substring(selectionStart, selectionEnd)
          const beforeSelection = value.substring(0, selectionStart)
          const afterSelection = value.substring(selectionEnd)

          // Check if text is already wrapped
          const isWrapped = beforeSelection.endsWith(wrapper) && afterSelection.startsWith(wrapper)

          let newValue: string
          let newCursorPos: number

          if (isWrapped) {
            // Remove wrapper
            newValue = beforeSelection.slice(0, -wrapper.length) + selectedText + afterSelection.slice(wrapper.length)
            newCursorPos = selectionStart - wrapper.length
          } else {
            // Add wrapper
            newValue = beforeSelection + wrapper + selectedText + wrapper + afterSelection
            newCursorPos = selectionStart + wrapper.length
          }

          onChangeValue?.(newValue)

          // Set cursor position after state update
          setTimeout(() => {
            if (selectedText) {
              // If there was selected text, select the wrapped text
              target.setSelectionRange(newCursorPos, newCursorPos + selectedText.length)
            } else {
              // If no selection, place cursor between the wrappers
              target.setSelectionRange(newCursorPos, newCursorPos)
            }
            target.focus()
          }, 0)
        }

        // Bold (Cmd/Ctrl + B)
        if (event.key === "b" && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
          wrapText("**")
        }

        // Italic (Cmd/Ctrl + I)
        if (event.key === "i" && (event.metaKey || event.ctrlKey)) {
          wrapText("*")
        }

        // Underline as strikethrough (Cmd/Ctrl + U)
        if (event.key === "u" && (event.metaKey || event.ctrlKey)) {
          wrapText("~~")
        }

        if (onEscape && event.key === "Escape") {
          event.preventDefault()
          event.stopPropagation()
          onEscape?.()
        }

        // Only submit on Enter for desktop (non-mobile devices)
        if (onSubmitMobile && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          // Check if this is a mobile device by testing for touch capability
          const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0
          if (!isMobile) {
            event.preventDefault()
            onSubmitMobile?.()
          }
        }
        if (onArrowUp && event.key === "ArrowUp" && !props.value?.toString().trim()) {
          event.preventDefault()
          onArrowUp?.()
        }
      }}
    />
  )
}
