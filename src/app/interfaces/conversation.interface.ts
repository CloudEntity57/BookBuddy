import { MessageDTO } from "./message.interface"
import { BookBuddyUser } from "./user.interface"

export interface Conversation {
    id: string,
    name: string,
    imageUrl?: string,
    isGroup: boolean,
    messages: Array<MessageDTO>,
    createdAt?: Date
    members: Array<ConversationMember>
}

export interface ConversationMember {
    userId: string,
    conversationId: string,
    role?: string,
    userName: string
}

export interface CreateConversationDto {
    name: string,
    imageUrl?: string,
    isGroup: boolean,
    createdAt?: Date
}