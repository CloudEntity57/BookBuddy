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

export interface GoogleBookResponse {
    kind: string,
    totalItems: number,
    items: Array<GoogleBookInfo>
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
    googleId?: string,
    author: string,
    title: string,
    usersWantToRead?: Array<BookBuddyUser>
}

export interface CreateBookDto {
    author: string,
    title: string,
}

export interface NYTimesListResponse {
    status: string,
    copyright: string,
    num_results: number,
    results: NYTimesResults,
    corrections: Array<object>	
}

export interface NYTimesResults {
    display_name: string,
    // Display name for the list.
    list_name_encoded: string,
    // List name encoded for the URL path.
    published_date: string,
    // When the list was in print.
    updated: string,
    // How often the list is updated (WEEKLY or MONTHLY).
    previous_published_date: string,
    // Date of previous list if exists.
    next_published_date: string,
    // Date of next list if exists.
    books: Array<NyTimesBook>
}

export interface NyTimesBook {
    googleBooksVersion: GoogleBookInfo,
    rank: number,
    // Rank on the list.
    rank_last_week: number,
    // Rank on list last week.
    weeks_on_list: number,
    // Number of weeks on list.
    asterisk: number
    // Book's sales are barely distinguishable from those of the book above it.
    dagger: number,
    // Some retailers report receiving bulk orders.
    primary_isbn13: string,
    // The book's ID, which is usually an ISBN 13.
    publisher: string,
    // Publisher name.
    description: string,
    // A short description of the book.
    title: string,
    // The book title.
    author: string,
    // The book author.
    contributor: string,
    // The book author.
    book_image: string,
    // Book cover image.
    book_image_height: number,
    book_image_width: number,
    amazon_product_url: string,
    // A link to the book on Amazon.
    age_group: string,
   // Book age group.
    book_review_link: string,
    // Link to NYT book review.
    sunday_review_link: string
    // Link to NYT Sunday book review.
}