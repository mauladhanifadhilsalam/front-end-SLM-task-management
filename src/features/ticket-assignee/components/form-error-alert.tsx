import * as React from "react"

type FormErrorAlertProps = {
  message: string | null
}

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) return null

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  )
}
