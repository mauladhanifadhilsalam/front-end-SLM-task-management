export function getCurrentUserId(): number {
  try {
    const token = localStorage.getItem("token")
    if (!token) return 0

    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))

    return Number(decoded.sub ?? 0)
  } catch (err) {
    console.error("Failed to decode token:", err)
    return 0
  }
}

export function getCurrentUserRole(): string | null {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null

    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))

    return decoded.role ?? null
  } catch {
    return null
  }
}
export function getCurrentUserName(): string | null {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null

    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))

    return decoded.fullName ?? null
  } catch {
    return null
  }
}
