export interface TagDto {
  id: string
  name: string
}

export enum TagType {
  Vibe = "Vibe",
  Social = "Social",
  Role = "Role"
}

export const mainTagCategories = () => {
  return [TagType.Vibe, TagType.Social, TagType.Role].map(type => ({
    id: type,
    label: getTagLabel(type),
    children: []
  }))
}

export const getChildrenIds = (tags: TagDto[], tagType: TagType): string[] => {
  return tags.filter(tag => getTagType(tag.id) === tagType).map(tag => tag.id)
}

export const getTagType = (tagIdInput: string): TagType | null => {
  if (!tagIdInput || isNaN(Number(tagIdInput))) {
    return null
  }
  const tagId = parseInt(tagIdInput, 10)
  if (tagId >= 410 && tagId < 419) {
    return TagType.Vibe
  } else if (tagId >= 420 && tagId < 429) {
    return TagType.Social
  } else if (tagId >= 430 && tagId < 439) {
    return TagType.Role
  } else {
    return null
  }
}

export const getTagLabel = (tagType: TagType): string => {
  switch (tagType) {
    case TagType.Vibe:
      return "Klimat"
    case TagType.Social:
      return "Towarzystwo"
    case TagType.Role:
      return "Rola"
    default:
      return ""
  }
}
