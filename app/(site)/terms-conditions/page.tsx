import type { Metadata } from "next"
import { LegalDocument, readLegalMarkdown } from "../../../components/legalDocument"

export const metadata: Metadata = {
  title: "Regulamin - Simplygo",
  description: "Przeczytaj regulamin korzystania z serwisu Simplygo i zasady publikowania treści.",
  alternates: {
    canonical: "/terms-conditions"
  }
}

export default async function TermsConditionsPage() {
  const markdown = await readLegalMarkdown("termsConditions.md")

  return <LegalDocument title="Regulamin Serwisu Simplygo" markdown={markdown} />
}
