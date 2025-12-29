export const normalizeSearch = (value: string) =>
  value.trim().toLowerCase()

export const buildSearchText = (
  values: Array<string | number | null | undefined>,
) =>
  values
    .map((value) =>
      value === null || value === undefined ? "" : String(value),
    )
    .join(" ")
    .toLowerCase()
