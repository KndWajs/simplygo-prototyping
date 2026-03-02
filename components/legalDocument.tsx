import { promises as fs } from "node:fs"
import path from "node:path"
import { Box, Container, Divider, Typography } from "@mui/material"

type HeadingLevel = 1 | 2 | 3 | 4

type Block =
  | { id: string; type: "heading"; level: HeadingLevel; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "list"; items: string[] }
  | { id: string; type: "divider" }

const headingVariantMap: Record<HeadingLevel, "h4" | "h5" | "h6" | "subtitle1"> = {
  1: "h4",
  2: "h5",
  3: "h6",
  4: "subtitle1"
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: Block[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let blockCounter = 0

  const nextBlockId = (type: Block["type"]) => {
    blockCounter += 1
    return `${type}-${blockCounter}`
  }

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return
    }

    blocks.push({
      id: nextBlockId("paragraph"),
      type: "paragraph",
      text: paragraphLines.join(" ").trim()
    })
    paragraphLines = []
  }

  const flushList = () => {
    if (listItems.length === 0) {
      return
    }

    blocks.push({
      id: nextBlockId("list"),
      type: "list",
      items: [...listItems]
    })
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    if (trimmed === "---") {
      flushParagraph()
      flushList()
      blocks.push({ id: nextBlockId("divider"), type: "divider" })
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      blocks.push({
        id: nextBlockId("heading"),
        type: "heading",
        level: headingMatch[1].length as HeadingLevel,
        text: headingMatch[2].trim()
      })
      continue
    }

    const listMatch = trimmed.match(/^-\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      listItems.push(listMatch[1].trim())
      continue
    }

    flushList()
    paragraphLines.push(trimmed)
  }

  flushParagraph()
  flushList()
  return blocks
}

function blockSpacing(blockType: Block["type"]): number {
  if (blockType === "divider") {
    return 3
  }

  if (blockType === "heading") {
    return 2
  }

  return 1.5
}

export async function readLegalMarkdown(fileName: string) {
  const filePath = path.join(process.cwd(), "public", fileName)
  return fs.readFile(filePath, "utf8")
}

export function LegalDocument({ title, markdown }: { title: string; markdown: string }) {
  const blocks = parseMarkdown(markdown)

  return (
    <Container component="article" maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography component="h1" variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
        {title}
      </Typography>
      {blocks.map(block => {
        const marginBottom = blockSpacing(block.type)

        if (block.type === "divider") {
          return <Divider key={block.id} sx={{ mb: marginBottom }} />
        }

        if (block.type === "heading") {
          const variant = headingVariantMap[block.level]
          const headingTag = `h${Math.min(block.level + 1, 6)}` as "h2" | "h3" | "h4" | "h5"

          return (
            <Typography
              component={headingTag}
              key={block.id}
              variant={variant}
              sx={{ mb: marginBottom, mt: 1, fontWeight: 700 }}
            >
              {block.text}
            </Typography>
          )
        }

        if (block.type === "list") {
          const itemKeyCounter = new Map<string, number>()

          return (
            <Box component="ul" key={block.id} sx={{ pl: 3, mb: marginBottom }}>
              {block.items.map(item => {
                const count = itemKeyCounter.get(item) ?? 0
                itemKeyCounter.set(item, count + 1)

                return (
                  <Typography component="li" key={`${item}-${count}`} sx={{ mb: 1 }}>
                    {item}
                  </Typography>
                )
              })}
            </Box>
          )
        }

        return (
          <Typography key={block.id} paragraph sx={{ mb: marginBottom }}>
            {block.text}
          </Typography>
        )
      })}
    </Container>
  )
}
