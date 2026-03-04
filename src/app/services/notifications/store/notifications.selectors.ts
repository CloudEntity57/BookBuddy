import { createFeatureSelector, createSelector } from "@ngrx/store";
import { NotificationsState } from "./notifications.state";

export const selectNotificationsFeature = createFeatureSelector<NotificationsState>('notificationsState');
export const selectNotifications = createSelector(
    selectNotificationsFeature,
    (state) => state.notifications
)