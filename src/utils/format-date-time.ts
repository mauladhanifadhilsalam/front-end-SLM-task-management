export const formatDateTime = (
    iso?: string,
    locale: string = "id-ID",
    ): string => {
    if (!iso) return "-"
    try {
        return new Date(iso).toLocaleString(locale)
    } catch {
        return iso
    }
}
