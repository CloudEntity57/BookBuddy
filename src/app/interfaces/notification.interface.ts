export interface Notification {
    id: string,
    recipientId: string,
    actorId?: string,
    type: NotificationType,
    relatedEntityId?: string,
    isRead: boolean,
    timestamp: Date,
    message?: string
}

export enum NotificationType {
    BuddyRequest,
    MeetingInvite,
    BuddyPosted,
    BuddyReadBook,
    SystemAnnouncement,
    MessageReceived
}