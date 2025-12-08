import { SectionCards } from "@/components/section-cards"

type StatCard = {
  title: string
  value: number
  accent?: "blue" | "green" | "orange" | "purple"
}

type Props = {
  stats: StatCard[]
  loading?: boolean
}

export function StatsCards({ stats, loading }: Props) {
  return <SectionCards stats={stats} loading={loading} />
}
