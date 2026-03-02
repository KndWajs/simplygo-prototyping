import type { Metadata } from "next"
import { LegalDocument, readLegalMarkdown } from "../../../components/legalDocument"

export const metadata: Metadata = {
  title: "Polityka prywatności - Simplygo",
  description:
    "Dowiedz się, jak Simplygo zbiera i chroni dane osobowe oraz jakie prawa przysługują użytkownikom.",
  alternates: {
    canonical: "/privacy-policy"
  }
}

export default async function PrivacyPolicyPage() {
  const markdown = await readLegalMarkdown("privacyPolicy.md")

  return <LegalDocument title="Polityka Prywatności Simplygo" markdown={markdown} />
}
