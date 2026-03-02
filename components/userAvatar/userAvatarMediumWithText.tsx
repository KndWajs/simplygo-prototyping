import UserAvatar, { AvatarSize } from "./userAvatar"
import React from "react"
import { User } from "@auth0/auth0-spa-js"

export default function UserAvatarMediumWithText({
  user,
  upperText,
  bottomText,
  bottomTextStyle
}: {
  user: User | undefined
  upperText?: string
  bottomText?: string
  bottomTextStyle?: string
}): React.JSX.Element {
  return (
    <div className={"user-avatar-medium"}>
      <UserAvatar user={user} size={AvatarSize.MEDIUM} />
      <div className={"user-avatar-medium-text"}>
        <p className={"label-regular weight-medium neutral-900"}>{upperText}</p>
        <p className={bottomTextStyle ? bottomTextStyle : "label-small weight-regular neutral-500"}>
          {bottomText}
        </p>
      </div>
    </div>
  )
}
