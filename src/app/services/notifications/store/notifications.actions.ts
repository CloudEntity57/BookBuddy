import { createAction, props } from "@ngrx/store";
import { Notification } from "../../../interfaces/notification.interface";

export const loadNotifications = createAction('[Notifications API] Load Notifications',
    props<{userId: string}>()
);
export const notificationsLoaded = createAction('[Notifications API] Notifications Loaded',
    props<{notifications: Array<Notification>}>()
);
export const notificationsLoadedError = createAction('[Notifications API], Notifications Loaded Error',
    props<{error: string}>()
);