import { createReducer, on } from "@ngrx/store";
import { initialNotificationsState, NotificationsState } from "./notifications.state";
import { loadNotifications, notificationsLoaded, notificationsLoadedError } from "./notifications.actions";

export const notificationsReducer = createReducer(
    initialNotificationsState,
    on(loadNotifications, (state): NotificationsState => ({
        ...state,
        loading: true
    })),
    on(notificationsLoaded, (state, { notifications }): NotificationsState => ({
        ...state,
        notifications
    })),
    on(notificationsLoadedError, (state, { error }): NotificationsState => ({
        ...state,
        loading: false,
        error
    }))
)