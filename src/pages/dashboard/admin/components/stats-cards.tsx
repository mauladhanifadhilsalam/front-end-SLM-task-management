import { SectionCards } from "@/pages/dashboard/admin/components/section-cards"

type StatCard = {
  title: string
  value: number
}

type Props = {
  stats: StatCard[]
  loading?: boolean
}

export function StatsCards({ stats, loading }: Props) {
  return <SectionCards stats={stats} loading={loading} />
}
