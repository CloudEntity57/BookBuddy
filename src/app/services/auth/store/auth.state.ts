import { BookBuddyUser } from "../../../interfaces/user.interface";

export interface LoginState {
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    userInfo: BookBuddyUser | null;
    buddies: Array<BookBuddyUser> | null;
}

export const initialState: LoginState = {
    isLoggedIn: false,
    loading: false,
    error: null,
    userInfo: null,
    buddies: null
}