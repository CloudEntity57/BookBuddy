export interface AddMessageDTO{
    conversationId: string,
    senderId: string,
    content: string,
    attachmentUrl?: string,
    isEdited?: string
}
export interface MessageDTO{
    id: string,
    conversationId: string,
    senderId: string,
    content: string,
    sentAt: Date,
    attachmentUrl?: string,
    isEdited?: string
}