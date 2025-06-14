export interface GoogleBookInfo {
    id: string,
    kind?: string,
    selfLink: string,
    volumeInfo: {
        imageLinks: {
            smallThumbnail: string;
            thumbnail: string;
            small: string;
            medium: string;
            large: string;
        }
        authors: Array<string>,
        title: string,
        description?: string;
    }
}

export interface GoogleBookResults {
    items: Array<GoogleBookInfo>
}