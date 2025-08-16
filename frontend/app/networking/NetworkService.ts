
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
    image: string,
    coords?: { x: number, y: number, width: number, height: number, dropZoneIndex?: number }
): Promise<any> {
    const body = {
        img: image,
        coords: coords ?? { x: 0, y: 0, width: 0, height: 0, dropZoneIndex: 0 }
    };
    const jsonBody = JSON.stringify(body);
    return fetch(MauMauUpload + "?key=" + photobookId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsonBody,
    }).then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', response.status, errorText);
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
        return response.json();
    });
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

export function removeImage(photobookId: string, dropZoneIndex: number): Promise<any> {
    return fetch(MauMauURL + "/remove-image?key=" + photobookId + "&dropZoneIndex=" + dropZoneIndex, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Image removal failed:', response.status, errorText);
            throw new Error(`Image removal failed: ${response.status} ${errorText}`);
        }
        return response.json();
    });
}

export function updatePhotobookTitle(photobookId: string, title: string): Promise<any> {
    return fetch(MauMauURL + "/update-title?key=" + photobookId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    }).then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Title update failed:', response.status, errorText);
            throw new Error(`Title update failed: ${response.status} ${errorText}`);
        }
        return response.json();
    });
}

export function generatePDF(photobookId: string): Promise<Blob> {
    return fetch(MauMauURL + "/generate-pdf?key=" + photobookId, {
        method: "GET",
    }).then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('PDF generation failed:', response.status, errorText);
            throw new Error(`PDF generation failed: ${response.status} ${errorText}`);
        }
        return response.blob();
    });
}