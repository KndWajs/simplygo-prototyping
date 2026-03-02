import type { Metadata } from "next"
import { MyActivities } from "../../../components/myActivities/myActivities"

export const metadata: Metadata = {
  title: "Moje aktywności - Simplygo",
  description: "Zarządzaj stworzonymi i ulubionymi aktywnościami w aplikacji Simplygo.",
  alternates: {
    canonical: "/my-activities"
  },
  robots: "noindex, nofollow"
}

export default function MyActivitiesPage() {
  return <MyActivities />
}
