export interface GetCategoriesQueryResponse {
  success: boolean
  validationErrors?: string[] | null
  categoriesByMain?: { [key: string]: CategoryDto[] } | null
}

export interface CategoryDto {
  id: string
  label: string | null
  children: CategoryDto[] | null
  mainCategory?: string
}
