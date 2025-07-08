import { BookBuddyUser } from "./user.interface";

export interface GoogleBookInfo {
    source: "google",
    id: string,
    kind?: string,
    selfLink?: string,
    volumeInfo: {
        imageLinks?: {
            smallThumbnail?: string;
            thumbnail?: string;
            small?: string;
            medium?: string;
            large?: string;
            extraLarge?: string;
        }
        authors: Array<string>,
        title: string,
        description?: string;
        publishedDate: string;
        pageCount: number;
    }
}

export interface GoogleBookSearchResults {
    source: "google",
    items: Array<GoogleBookInfo>
}

export interface OpenLibraryBookSearchInfo {
    source: "openLibrary",
    author_key: Array<string>,
    author_name: Array<string>,
    cover_edition_key: string,
    cover_i: number,
    key: string, // i.e. /works/OL274482
    title: string

}

export interface OpenLibraryAuthorInfo {
    personal_name: string,
    name: string
}

export interface AuthorMetadata{
    author:{
        key: string
    },
    type:{
        key: string
    }
}

export interface OpenLibraryDataObject{
    type: string,
    value: string
}

export interface OpenLibraryWorkInfo {
    source: "openLibrary",
    description: {
        value: string
    }
    authors: Array<AuthorMetadata>,
    covers: Array<number>,
    subject_people: Array<string>,
    title: string,
    created: OpenLibraryDataObject

}
export interface OpenLibraryBookResults {
    source: "openLibrary",
    docs: Array<OpenLibraryBookSearchInfo>,
    numFound: number
}

export interface DatabaseBook {
    id: string,
    author: string,
    title: string,
    usersWantToRead?: Array<BookBuddyUser>
}

export interface CreateBookDto {
    author: string,
    title: string
}