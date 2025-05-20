
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