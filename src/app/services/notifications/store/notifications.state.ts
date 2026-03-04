import { Notification } from "../../../interfaces/notification.interface";

export interface NotificationsState{
    notifications: Array<Notification>,
    loading: boolean,
    error: string | null
}

export const initialNotificationsState: NotificationsState = {
    notifications: [],
    loading: false,
    error: null
}