"use client"

import { Box, Stack, styled, Typography } from "@mui/material"
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
import React, { useEffect, useMemo, useState } from "react"
import { Control, Controller } from "react-hook-form"
import { CategoryDto } from "../../../models/dtos/GetCategoriesQueryResponse"
import { getWithChildren } from "../../../utils/categoriesUtils"

const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

interface CustomTreeItemProps
  extends Omit<UseTreeItemParameters, "rootRef">,
    Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {
  checkboxOnlyForLeaves?: boolean
}

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
  const { id, itemId, label, disabled, children, checkboxOnlyForLeaves, ...other } = props

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
          {(!checkboxOnlyForLeaves || !status.expandable) && (
            <TreeItemCheckbox size="medium" {...getCheckboxProps()} />
          )}
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

interface SubcategoryTreeProps {
  control: Control<any>
  name: string
  onSelectedItemsChange: (event: React.SyntheticEvent | null, newCategories: string[]) => void
  categories: CategoryDto[]
  checkboxOnlyForLeaves?: boolean
  maxSelectedItems?: number
}

export const SubcategoryTree = ({
  name,
  control,
  onSelectedItemsChange,
  categories,
  checkboxOnlyForLeaves = false,
  maxSelectedItems
}: SubcategoryTreeProps) => {
  const collectIds = React.useCallback((nodes: CategoryDto[]): string[] => {
    return nodes.flatMap(n => [n.id, ...(n.children ? collectIds(n.children) : [])])
  }, [])

  const [expandedItems, setExpandedItems] = useState<string[]>([])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value || [SPORT_ID, EVENTS_ID, KIDS_ID]
        const selectedItems = getWithChildren(categories, value)
        const selectedSet = new Set<string>(selectedItems)

        const collectLeafIds = (nodes: CategoryDto[]): string[] =>
          nodes.flatMap(n =>
            n.children && n.children.length > 0 ? collectLeafIds(n.children) : [n.id]
          )

        const allLeafIds = collectLeafIds(categories)
        const selectedLeafCount = allLeafIds.reduce(
          (acc, id) => (selectedSet.has(id) ? acc + 1 : acc),
          0
        )

        const disableAdditional =
          typeof maxSelectedItems === "number" && maxSelectedItems > 0
            ? selectedLeafCount >= maxSelectedItems
            : false

        type ExtendedCategoryDto = CategoryDto & {
          disabled?: boolean
          children?: ExtendedCategoryDto[] | null
        }
        const markDisabledIfNeeded = (nodes: CategoryDto[]): ExtendedCategoryDto[] =>
          nodes.map(n => {
            const hasChildren = !!(n.children && n.children.length > 0)
            const children = hasChildren && n.children ? markDisabledIfNeeded(n.children) : null
            const isLeaf = !hasChildren
            const isSelected = selectedSet.has(n.id)
            const disabled = disableAdditional && isLeaf && !isSelected
            return {
              ...n,
              ...(disabled ? { disabled: true } : {}),
              children
            }
          })

        const itemsToRender: ExtendedCategoryDto[] = disableAdditional
          ? markDisabledIfNeeded(categories)
          : (categories as ExtendedCategoryDto[])

        return (
          <>
            {categories && categories.length > 0 && (
              <RichTreeView
                selectedItems={selectedItems}
                onSelectedItemsChange={(_event, newCategories) => {
                  field.onChange(newCategories)
                  onSelectedItemsChange(_event, newCategories)
                }}
                checkboxSelection
                multiSelect
                isItemDisabled={i => i.disabled || false}
                selectionPropagation={{ descendants: true, parents: true }}
                items={itemsToRender}
                slots={{ item: CustomTreeItem }}
                // @ts-ignore
                slotProps={{ item: { checkboxOnlyForLeaves } }}
                expandedItems={expandedItems}
                onExpandedItemsChange={(_e, ids) => setExpandedItems(ids)}
              />
            )}
          </>
        )
      }}
    />
  )
}
