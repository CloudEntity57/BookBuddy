import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LoginState } from "./auth.state";


export const selectLoginState = createFeatureSelector<LoginState>('loginState');

export const selectIsLoggedIn = createSelector(
    selectLoginState,
    (state) => state.isLoggedIn
)

export const selectUserInfo = createSelector(
    selectLoginState,
    (state) => state.userInfo
);

export const selectBuddies = createSelector(
    selectLoginState,
    (state) => state.buddies
);