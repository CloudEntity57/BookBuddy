import { inject } from "@angular/core";
import { NotificationsState } from "./notifications.state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { mergeMap, map } from "rxjs";
import { NotificationService } from "../notification.service";
import { loadNotifications, notificationsLoaded } from "./notifications.actions";

export class NotificationsEffects{
    private actions$ = inject(Actions);
    private notificationService = inject(NotificationService);
    public loadNotifications$ = createEffect(() => this.actions$.pipe(
        ofType(loadNotifications),
        mergeMap(action => this.notificationService.getUserNotifications(action.userId)
            .pipe(
                map(notifications => notificationsLoaded({notifications}))
            )
        )
    ));
}