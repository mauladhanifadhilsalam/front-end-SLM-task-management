export type TicketLite = {
  id: number
  title?: string
  project?: {
    id: number
    name?: string
  } | null
}
