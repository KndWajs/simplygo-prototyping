import { CategoryDto } from "../models/dtos/GetCategoriesQueryResponse"

function collectIds(node: CategoryDto): string[] {
  const ids = [node.id]
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectIds(child))
    }
  }
  return ids
}

function findNode(nodes: CategoryDto[], id: string): CategoryDto | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const inChild = findNode(node.children ?? [], id)
    if (inChild) return inChild
  }
  return undefined
}

export function getWithChildren(categories: CategoryDto[], selectedIds?: string[]): string[] {
  if (!selectedIds?.length || !categories?.length) return []

  const out = new Set<string>()
  for (const id of selectedIds) {
    const node = findNode(categories, id)
    if (node) {
      for (const cid of collectIds(node)) {
        out.add(cid)
      }
    }
  }
  return [...out]
}

/** Like getWithChildren but excludes root category IDs (1, 2, 3) — only returns subcategory IDs that the backend can match. */
export function getSubcategoryIds(categories: CategoryDto[], selectedIds?: string[]): string[] {
  const rootIds = new Set(categories.map(c => c.id))
  return getWithChildren(categories, selectedIds).filter(id => !rootIds.has(id))
}
