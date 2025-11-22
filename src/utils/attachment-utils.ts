import type { Attachment } from "@/types/file-attachment.type"

export const isImageAttachment = (att: Attachment) => {
    if (att.mimeType && att.mimeType.startsWith("image/")) return true
    const name = (att.fileName || "").toLowerCase()
    return (
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".webp") ||
        name.endsWith(".gif")
    )
}

export const getAttachmentFileSrc = (att: Attachment) => {
    if (att.base64) {
        return `data:${att.mimeType};base64,${att.base64}`
    }
    return att.url || ""
}

export const getAttachmentImageSrc = (att: Attachment) =>
    getAttachmentFileSrc(att)
