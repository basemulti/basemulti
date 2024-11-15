'use client'

import ErrorComponent from "@/components/error"

export default function ErrorPage({ error }: {
  error: Error
}) {
  return <ErrorComponent
    code={500}
    title="Internal Server Error"
    description={error.message}
  />
}