export const environment = {
    production: false,
    apiUrl: 'https://localhost:7092/api',
    oauthClientId: '921071488707-kusrp5jrol9g7uekdgqbseqk6c5o8p07.apps.googleusercontent.com',
    books:{
        googleBookSearchApi: "https://www.googleapis.com/books/v1/volumes?q=",
        googleBookFetchApi: "https://www.googleapis.com/books/v1/volumes/",
        openLibraryBookSearchApi: "https://openlibrary.org/search.json?q=",
        openLibraryWorksApi: "https://openlibrary.org",
        openLibraryCoverApi: "https://covers.openlibrary.org/b/id/",

        /** GOOGLE API */
        bookSearchApi: "google",
        bookByIdApi: "google",
        
        /** OPEN LIBRARY API */
        // bookSearchApi: "openLibrary",
        // bookByIdApi: "openLibrary",
    }
}