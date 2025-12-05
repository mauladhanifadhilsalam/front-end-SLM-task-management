type PlainObject = Record<string, unknown>

const isObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null

const DEFAULT_ARRAY_KEYS = [
  "data",
  "items",
  "results",
  "records",
  "list",
  "payload",
  "rows",
]

export const unwrapApiData = <T>(payload: unknown): T => {
  if (!isObject(payload)) {
    return payload as T
  }

  if ("data" in payload && payload.data !== undefined) {
    return unwrapApiData<T>((payload as PlainObject).data)
  }

  if ("result" in payload && payload.result !== undefined) {
    return unwrapApiData<T>((payload as PlainObject).result)
  }

  if ("payload" in payload && payload.payload !== undefined) {
    return unwrapApiData<T>((payload as PlainObject).payload)
  }

  return payload as T
}

export const extractArrayFromApi = <T>(
  payload: unknown,
  extraKeys: string[] = [],
): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!isObject(payload)) {
    return []
  }

  const keysToInspect = [...DEFAULT_ARRAY_KEYS, ...extraKeys]

  for (const key of keysToInspect) {
    if (key in payload) {
      const nested = (payload as PlainObject)[key]
      const nestedArray = extractArrayFromApi<T>(nested, extraKeys)
      if (nestedArray.length > 0 || Array.isArray(nested)) {
        return nestedArray
      }
    }
  }

  return [payload as T]
}
