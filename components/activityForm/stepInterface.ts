import { ActivityMetadataDto, QueryActivityDto } from "../../models/domainDtos"
import { Control, UseFormSetValue } from "react-hook-form"

export interface StepInterface {
  activity: QueryActivityDto
  cancelButton?: { action: (a: QueryActivityDto) => void; name: string }
  submitButton: { action: (a: QueryActivityDto) => void; name: string }
  loading?: boolean
  metadata?: ActivityMetadataDto
}

export interface ControlProps {
  control: Control<QueryActivityDto>
}

export interface ControlPlusProps extends ControlProps {
  setValue: UseFormSetValue<QueryActivityDto>
}
