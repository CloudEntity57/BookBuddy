export const environment = {
    production: true,
    ssr: false,
    apiUrl: 'https://api.joinbookbuddy.com/api',
    hubsUrl: 'https://api.joinbookbuddy.com/hubs',
    rootUrl: 'https://joinbookbuddy.com',
    redirectUri: 'https://joinbookbuddy.com/auth-callback',

    // oauthClientId: '921071488707-kusrp5jrol9g7uekdgqbseqk6c5o8p07.apps.googleusercontent.com',
    googleBooksAPIKey: 'AIzaSyCyEYmVR85HOs9ZuoU4C0t17ieyz5T7AoM',
    //Bookbuddy 2026 client:
    oauthClientId: '921071488707-tu04a0mvlm2k21r1qo2a6ejomc2vs58u.apps.googleusercontent.com',

    // UWP client:
    // oauthClientId: '921071488707-kusrp5jrol9g7uekdgqbseqk6c5o8p07.apps.googleusercontent.com',

    // Web Client 3 client:
    // oauthClientId: '921071488707-08qe055lk2vv7la2cu4q0sehksaprfot.apps.googleusercontent.com',    
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

        /** NYT Bestsellers API */
        nytBooksApiToken: "wNmhxQjxQXOltAcx2JFkIRaTpAiDGG6z",
        nytBooksApi: "https://api.nytimes.com/svc/books/v3/lists"
    }
}