export const formatBytes = (bytes?: number) => {
    if (!bytes && bytes !== 0) return "-"
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB", "TB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
    return `${v} ${sizes[i]}`
}
