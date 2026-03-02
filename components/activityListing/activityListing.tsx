import { Box, Grid, Typography } from "@mui/material"
import { ActiveFilters } from "components/activeFilters/activeFilters"
import { ActivityList } from "components/activityList/activityList"
import { LoadingOverlay } from "components/activityListing/loadingOverlay"
import { FilterDrawer } from "components/filterDrawer/filterDrawer"
import { Filters } from "components/filters/filters"
import { SearchBar } from "components/searchBar/searchBar"
import { SortButton } from "components/sortButton/sortButton"
import { MapButton } from "components/mapModal/mapButton"
import type { GetActivitiesQuery } from "models/domainDtos"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import type { TagDto } from "models/dtos/tagDto"
import { serializeFilters } from "models/services/filters.service"
import { getSubcategoryIds } from "utils/categoriesUtils"

const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

interface ActivityListingProps {
  query: GetActivitiesQuery
  searchResult: {
    activities: any[]
    hasMore: boolean
    extendedSearch?: boolean
  }
  categories: CategoryDto[]
  tags: TagDto[]
  heading?: string
  introText?: string
}

export function ActivityListing({
  query,
  searchResult,
  categories,
  tags,
  heading,
  introText
}: ActivityListingProps) {
  const categoryGroups = {
    sport: getSubcategoryIds(categories, [SPORT_ID]),
    event: getSubcategoryIds(categories, [EVENTS_ID]),
    kids: getSubcategoryIds(categories, [KIDS_ID])
  }

  return (
    <>
      <SearchBar query={query} categoryGroups={categoryGroups} />
      {heading && (
        <Box sx={{ maxWidth: "1100px", width: "100%", px: 1, mt: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {heading}
          </Typography>
          {introText && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {introText}
            </Typography>
          )}
        </Box>
      )}
      <Grid
        container
        size={12}
        sx={{
          width: "100%",
          height: "100%",
          flex: 1,
          flexDirection: "column",
          display: "flex",
          maxWidth: "1100px"
        }}
      >
        <Grid
          container
          size={12}
          spacing={2}
          alignItems="center"
          sx={{
            flex: "0 0 auto",
            position: "sticky",
            top: "-1px",
            left: 0,
            zIndex: 10,
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.95)"
          }}
        >
          <Grid
            size={{ xs: 4, md: 5 }}
            alignItems="center"
            display={"flex"}
            gap={"8px"}
            justifyContent={{ xs: "center", md: "flex-start" }}
          >
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <FilterDrawer query={query} categories={categories} tags={tags} />
            </Box>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <ActiveFilters query={query} tags={tags} />
            </Box>
          </Grid>
          <Grid
            size={{ xs: 4, md: 3 }}
            display="flex"
            justifyContent={{ xs: "center", md: "flex-start" }}
          >
            <SortButton label={"Sortuj po:"} query={query} />
          </Grid>
          <Grid size={{ xs: 4, md: 4 }} display={"flex"} justifyContent={"center"}>
            <MapButton
              query={query}
              categories={categories}
              tags={tags}
              userCoordinates={query.coordinates}
            />
          </Grid>
        </Grid>
        <div
          className="desktop-hidden"
          style={{
            marginTop: "8px",
            marginBottom: "8px",
            marginLeft: "8px",
            marginRight: "8px"
          }}
        >
          <ActiveFilters query={query} tags={tags} />
        </div>
        <Grid
          container
          size={12}
          sx={{
            display: "flex",
            flex: "1 1",
            minHeight: 0,
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch"
          }}
          spacing={2}
        >
          <Grid
            size={{ xs: 0, md: 3 }}
            sx={{
              display: { xs: "none", md: "flex" },
              borderRight: "1px solid #ccc",
              paddingRight: "16px"
            }}
          >
            <Filters query={query} categories={categories} tags={tags} />
          </Grid>
          <Grid
            size={{ xs: 12, md: 9 }}
            sx={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <LoadingOverlay>
              <ActivityList
                key={serializeFilters(query).toString()}
                initialActivities={searchResult.activities}
                initialHasMore={searchResult.hasMore}
                query={query}
                userCoordinates={query.coordinates}
                extendedSearch={searchResult.extendedSearch}
              />
            </LoadingOverlay>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
