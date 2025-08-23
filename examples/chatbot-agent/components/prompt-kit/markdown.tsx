import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { CodeBlock, CodeBlockCode } from "./code-block"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
  hr: function HrComponent(props) {
    return <hr className={cn("my-3 border-border/70", (props as any).className)} {...props} />
  },
  h1: function H1({ className, children, ...props }) {
    return (
      <h1
        className={cn(
          "mt-4 mb-2 text-2xl md:text-3xl font-semibold leading-tight",
          className
        )}
        {...(props as any)}
      >
        {children}
      </h1>
    )
  },
  h2: function H2({ className, children, ...props }) {
    return (
      <h2
        className={cn(
          "mt-4 mb-2 text-xl md:text-2xl font-semibold leading-tight",
          className
        )}
        {...(props as any)}
      >
        {children}
      </h2>
    )
  },
  h3: function H3({ className, children, ...props }) {
    return (
      <h3
        className={cn(
          "mt-3 mb-1.5 text-lg md:text-xl font-semibold leading-tight",
          className
        )}
        {...(props as any)}
      >
        {children}
      </h3>
    )
  },
  h4: function H4({ className, children, ...props }) {
    return (
      <h4
        className={cn(
          "mt-3 mb-1 text-base md:text-lg font-semibold leading-tight",
          className
        )}
        {...(props as any)}
      >
        {children}
      </h4>
    )
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
