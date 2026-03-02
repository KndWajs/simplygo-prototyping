import type { Metadata } from "next"
import { Suspense } from "react"
import { ActivityForm } from "../../../components/activityForm/activityForm"

export const metadata: Metadata = {
  title: "Dodaj aktywność - Simplygo",
  description: "Formularz dodawania wydarzeń i miejsc, które promujesz w Simplygo.",
  alternates: {
    canonical: "/add-activity"
  },
  robots: "noindex, nofollow"
}

export default function AddActivityPage() {
  return (
    <Suspense>
      <ActivityForm />
    </Suspense>
  )
}
