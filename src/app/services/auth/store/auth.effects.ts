import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { BuddyService } from "../../buddies/buddy.service";
import { buddiesUpdated, loadBuddies } from "./auth.actions";
import { map, tap, mergeMap } from "rxjs";

export class AuthEffects {
    private actions$ = inject(Actions);
    private buddyService = inject(BuddyService);
    public getBuddies$ = createEffect(() => this.actions$.pipe(
        ofType(loadBuddies),
        mergeMap(action => this.buddyService.getBuddies(action.userId)
            .pipe(
                map(buddies => (buddiesUpdated({buddies})))
            )
        )
    ))
}