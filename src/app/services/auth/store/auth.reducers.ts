import { createReducer, on } from "@ngrx/store";
import { initialState, LoginState } from "./auth.state";
import { login, logout, loginError, loginSuccess, logoutSuccess, logoutError, userInfoUpdated, buddiesUpdated } from "./auth.actions";

export const loginReducer = createReducer(
    initialState,
    on(login, (state): LoginState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(loginSuccess, (state): LoginState => ({
        ...state,
        isLoggedIn: true,
        error: null
    })),
    on(loginError, (state, { error }): LoginState => ({
        ...state,
        error
    })),
    on(logout, (state): LoginState => ({
        ...state,
        loading: true,
        error: null
    })),
    on(logoutSuccess, (state): LoginState => ({
        ...state,
        isLoggedIn: false,
        error: null
    })),
    on(logoutError, (state, { error }): LoginState => ({
        ...state,
        error
    })),
    on(userInfoUpdated, (state, { userInfo }): LoginState => ({
        ...state,
        userInfo
    })),
    on(buddiesUpdated,(state, { buddies }): LoginState => ({
        ...state,
        buddies
    }))
)