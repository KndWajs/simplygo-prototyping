import React from "react"

import "./userAvatar.scss"
import { User } from "@auth0/auth0-spa-js"

export enum AvatarSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge"
}

export default function UserAvatar({
  user,
  size = AvatarSize.MEDIUM
}: {
  user: User | undefined
  size?: AvatarSize
}): React.JSX.Element {
  const getUserInitials = () => {
    if (user) {
      let givenN = ""
      let familyN = ""

      if (user.given_name && user.family_name) {
        givenN = user.given_name?.charAt(0) || " "
        familyN = user.family_name?.charAt(0) || " "
      } else if (user.name) {
        const names = user.name.split(" ")
        givenN = names[0]?.charAt(0) || " "
        familyN = names[1]?.charAt(0) || " "
      }

      return givenN.charAt(0).toUpperCase() + familyN.charAt(0).toUpperCase()
    }
  }

  return (
    <>{user && <div className={`avatar-image avatar-image-${size}`}>{getUserInitials()}</div>}</>
  )
}
