const MauMauURL = "http://localhost:3000";

// Get auth token from localStorage
function getAuthToken(): string | null {
    return localStorage.getItem('token');
}

// Get headers with auth token
function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// Handle response with 401 redirect
async function handleResponse<T>(response: Response, parseAs: 'json' | 'blob' = 'json'): Promise<T> {
    if (response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Request failed:', response.status, errorText);
        throw new Error(`Request failed: ${response.status} ${errorText}`);
    }

    if (parseAs === 'blob') {
        return response.blob() as Promise<T>;
    }
    return response.json() as Promise<T>;
}

export function createPhotobook(title?: string): Promise<{ key: string }> {
    return fetch(MauMauURL + "/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
    }).then((response) => handleResponse(response));
}

export function viewPhotobook(photobookId: string): Promise<any> {
    return fetch(MauMauURL + "/photobook?key=" + photobookId, {
        method: "GET",
        headers: getAuthHeaders(),
    }).then((response) => handleResponse(response));
}

export function listPhotobooks(): Promise<any[]> {
    return fetch(MauMauURL + "/photobooks", {
        method: "GET",
        headers: getAuthHeaders(),
    }).then((response) => handleResponse(response));
}

export function deletePhotobook(photobookId: string): Promise<{ success: boolean }> {
    return fetch(MauMauURL + "/photobook?key=" + photobookId, {
        method: "DELETE",
        headers: getAuthHeaders(),
    }).then((response) => handleResponse(response));
}

export function uploadImage(
    photobookId: string,
    image: string,
    dropZoneIndex: number,
    pageNumber: number = 1,
    layout: string = 'horizontal-triplet'
): Promise<{ success: boolean; dropZoneIndex: number }> {
    return fetch(MauMauURL + "/upload?key=" + photobookId, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            img: image,
            dropZoneIndex,
            pageNumber,
            layout,
        }),
    }).then((response) => handleResponse(response));
}

export function removeImage(
    photobookId: string,
    dropZoneIndex: number,
    pageNumber: number = 1
): Promise<{ success: boolean }> {
    const url = `${MauMauURL}/remove-image?key=${photobookId}&dropZoneIndex=${dropZoneIndex}&pageNumber=${pageNumber}`;
    return fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
    }).then((response) => handleResponse(response));
}

export function addPage(
    photobookId: string,
    layout: string = 'horizontal-triplet'
): Promise<{ success: boolean; pageNumber: number }> {
    return fetch(MauMauURL + "/add-page?key=" + photobookId, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ layout }),
    }).then((response) => handleResponse(response));
}

export function updatePageOrder(
    photobookId: string,
    order: number[]
): Promise<{ success: boolean }> {
    return fetch(MauMauURL + "/page-order?key=" + photobookId, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ order }),
    }).then((response) => handleResponse(response));
}

export function updatePageLayout(
    photobookId: string,
    pageNumber: number,
    layout: string
): Promise<{ success: boolean }> {
    return fetch(MauMauURL + "/page-layout?key=" + photobookId, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ pageNumber, layout }),
    }).then((response) => handleResponse(response));
}

export function updatePhotobookTitle(
    photobookId: string,
    title: string
): Promise<{ success: boolean; title: string }> {
    return fetch(MauMauURL + "/update-title?key=" + photobookId, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
    }).then((response) => handleResponse(response));
}

export function generatePDF(photobookId: string): Promise<Blob> {
    return fetch(MauMauURL + "/generate-pdf?key=" + photobookId, {
        method: "GET",
        headers: getAuthHeaders(),
    }).then((response) => handleResponse<Blob>(response, 'blob'));
}
