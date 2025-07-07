
const MauMauURL = "http://localhost:3000";
const MauMauCreate = MauMauURL + "/create";
const MauMauView = MauMauURL + "/photobook";
const MauMauUpload = MauMauURL + "/upload";
const MauMauAddPage = MauMauURL + "/addPage";

export function createPhotobook(
    title: string,
    pageFormat: string,
    pageCount: number
): Promise<any> {
    return fetch(MauMauCreate, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: title,
            pageFormat: pageFormat,
            pageCount: pageCount,
        }),
    }).then((response) => 
        response.json()
    );
}

export function viewPhotobook(
    photobookId: string
): Promise<any> {
    console.log("Photobook ID:", photobookId);
    return fetch(MauMauView + "?key=" + photobookId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => 
        response.json()
    );
}

export function uploadImage(
    photobookId: string,
    image: string
): Promise<any> {
    const body = {
        img: image
    }
    const jsonBody = JSON.stringify(body);
    return fetch(MauMauUpload + "?key=" + photobookId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonBody,
    }).then((response) => 
        response.json()
    );
}

export function addPage(
    photobookId: string,
    pageData: any
): Promise<any> {
    return fetch(MauMauAddPage + "?key=" + photobookId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
    }).then((response) => 
        response.json()
    );
}