import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from "@mui/material"
import { CATEGORIES } from "../../data/categories"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import type { QueryActivityDto } from "models/domainDtos"

const CITY_LABEL = "Szczecin"
const CITY_SLUG = "szczecin"

function findPath(
  nodes: CategoryDto[],
  targetId: string,
  path: { id: string; label: string }[] = []
): { id: string; label: string }[] | null {
  for (const node of nodes) {
    const current = [...path, { id: node.id, label: node.label ?? node.id }]
    if (node.id === targetId) return current
    if (node.children) {
      const found = findPath(node.children, targetId, current)
      if (found) return found
    }
  }
  return null
}

interface ActivityBreadcrumbsProps {
  activity: QueryActivityDto
  city: string
}

export function ActivityBreadcrumbs({ activity, city }: ActivityBreadcrumbsProps) {
  const firstCategory = activity.categories?.[0]
  const categoryPath = firstCategory ? findPath(CATEGORIES, firstCategory.id) : null

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{
        mb: 1,
        fontSize: 14,
        flexWrap: "nowrap",
        overflow: "auto",
        "& ol": { flexWrap: "nowrap" },
        "& li": { whiteSpace: "nowrap" }
      }}
    >
      <Link underline="hover" color="inherit" href="/wydarzenia">
        Wydarzenia
      </Link>
      <Link
        underline="hover"
        color="inherit"
        href={`/wydarzenia/${city}`}
      >
        {CITY_LABEL}
      </Link>
      {categoryPath?.map((cat, i) => {
        const isLast = i === categoryPath.length - 1
        return isLast ? (
          <Typography key={cat.id} color="text.primary" sx={{ fontSize: 14 }}>
            {cat.label}
          </Typography>
        ) : (
          <Typography key={cat.id} color="text.secondary" sx={{ fontSize: 14 }}>
            {cat.label}
          </Typography>
        )
      })}
    </MuiBreadcrumbs>
  )
}
