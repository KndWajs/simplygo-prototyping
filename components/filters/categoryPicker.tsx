"use client"

import { Box, Divider, Stack, styled, Typography } from "@mui/material"
import {
  RichTreeView,
  TreeItemProvider,
  useTreeItem,
  type UseTreeItemParameters,
  type UseTreeItemStatus
} from "@mui/x-tree-view"
import {
  TreeItemCheckbox,
  TreeItemContent,
  TreeItemGroupTransition,
  TreeItemIconContainer,
  TreeItemLabel
} from "@mui/x-tree-view/TreeItem"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import type { GetActivitiesQuery } from "models/domainDtos"
import { updateUrlWithQuery } from "models/services/filters.service"
import { getWithChildren } from "utils/categoriesUtils"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"

const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

interface CustomTreeItemProps
  extends Omit<UseTreeItemParameters, "rootRef">,
    Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {}

const TreeItemRoot = styled("li")({
  listStyle: "none",
  margin: 0,
  padding: 0,
  outline: 0
})

const getTreeIcon = (status: UseTreeItemStatus) => {
  if (status.expanded) return "zwiń"
  if (status.expandable) return "więcej"
  return ""
}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props

  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    status
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref })

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <TreeItemRoot {...getRootProps(other)}>
        <div style={{ height: "4px" }} />
        <TreeItemContent {...getContentProps()} style={{ backgroundColor: "#efece6" }}>
          <TreeItemCheckbox size="medium" {...getCheckboxProps()} />
          <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
            <TreeItemLabel {...getLabelProps()}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant={[KIDS_ID, SPORT_ID, EVENTS_ID].includes(itemId) ? "body1" : "body2"}
                >
                  {label}
                </Typography>
              </Stack>
            </TreeItemLabel>
          </Box>
          <TreeItemIconContainer
            {...getIconContainerProps()}
            style={{ width: "50px", textAlign: "center" }}
          >
            <Typography variant="body2" color="info.main" sx={{ cursor: "pointer" }}>
              {getTreeIcon(status)}
            </Typography>
          </TreeItemIconContainer>
        </TreeItemContent>
        {children && (
          <TreeItemGroupTransition {...getGroupTransitionProps()} unmountOnExit={false} />
        )}
      </TreeItemRoot>
    </TreeItemProvider>
  )
})

interface CategoryPickerProps {
  categories: CategoryDto[]
  query: GetActivitiesQuery
  onQueryChange?: (q: GetActivitiesQuery) => void
}

export function CategoryPicker({ categories, query, onQueryChange }: CategoryPickerProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigateWithQuery = useCallback(
    (nextQuery: GetActivitiesQuery) => {
      if (onQueryChange) {
        onQueryChange(nextQuery)
        return
      }
      updateUrlWithQuery({
        pathname,
        query: nextQuery,
        navigate: replace
      })
    },
    [pathname, replace, onQueryChange]
  )

  const selectedItems = useMemo(
    () => getWithChildren(categories, query.categoryIds ?? [SPORT_ID, EVENTS_ID, KIDS_ID]),
    [categories, query.categoryIds]
  )

  const rootIds = new Set(categories.map(c => c.id))

  const handleSelectionChange = (_event: React.SyntheticEvent | null, newSelected: string[]) => {
    const filtered = newSelected.filter(id => !rootIds.has(id))
    const nextQuery = {
      ...query,
      categoryIds: filtered.length > 0 ? filtered : undefined
    }
    if (onQueryChange) {
      onQueryChange(nextQuery)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigateWithQuery(nextQuery)
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!categories || categories.length === 0) return null

  return (
    <>
      <Divider sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" textAlign="center">
          Kategorie
        </Typography>
      </Divider>
      <RichTreeView
        selectedItems={selectedItems}
        onSelectedItemsChange={handleSelectionChange}
        checkboxSelection
        multiSelect
        selectionPropagation={{ descendants: true, parents: true }}
        items={categories}
        slots={{ item: CustomTreeItem }}
        expandedItems={expandedItems}
        onExpandedItemsChange={(_e, ids) => setExpandedItems(ids)}
      />
    </>
  )
}
