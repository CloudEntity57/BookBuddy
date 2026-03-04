import { createAction, props } from "@ngrx/store";
import { LoginState } from "./auth.state";
import { BookBuddyUser } from "../../../interfaces/user.interface";

export const login = createAction('[Auth API] Log In');

export const loginSuccess = createAction('[Auth API] Log In Success',
    props<{isLoggedIn: boolean}>()
);

export const loginError = createAction('[Auth API] Log In Error',
    props<{ error: string | null}>()
);

export const logout = createAction('[Auth API] Log Out');

export const logoutSuccess = createAction('[Auth API] Log Out Success',
    props<{isLoggedIn: boolean}>()
);

export const logoutError = createAction('[Auth API] Log Out Error',
    props<{ error: string | null}>()
);

export const userInfoUpdated = createAction('[User API] User Info Updated',
    props<{userInfo: BookBuddyUser | null}>()  
);

export const loadBuddies = createAction('[Buddy API] Load Buddies',
    props<{userId: string}>()
);

export const buddiesUpdated = createAction('[Buddy API] Buddies Updated',
    props<{buddies: Array<BookBuddyUser>}>()
)