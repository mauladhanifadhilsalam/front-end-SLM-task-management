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

export const formatDate = (iso?: string | null): string => {
  if (!iso) return "-";

  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso ?? "-";
  }
};

export const formatDateLong = (iso?: string | null): string => {
  if (!iso) return "-";

  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso ?? "-";
  }
};
