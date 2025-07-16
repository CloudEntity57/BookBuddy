import { DatabaseBook } from "./book.interface"

export interface GoogleUser{
    given_name: string,
    name: string,
    picture: string,
    email: string,
    email_verified: boolean
}

export interface UserAPIResponse{
    info: GoogleUser
}

export interface BookBuddyUser{
    id: string,
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    avatarUrl?: string,
    createdAt?: string,
    lastLoginAt?: string,
    wantToRead?: Array<DatabaseBook>
}

export interface BookBuddyCreateUser{
    userName: string,
    email: string,
    avatarUrl?: string,
    createdAt?: Date,
    lastLoginAt?: Date
}