const MauMauURL = "/api";

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

// Silent refresh state — prevents multiple concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetch(MauMauURL + "/auth/refresh", {
        method: "POST",
        credentials: "include",
    })
        .then(async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                return data.token as string;
            }
            return null;
        })
        .catch(() => null)
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

// Handle response with silent refresh on 401
async function handleResponse<T>(
    response: Response,
    retryFn?: () => Promise<Response>,
    parseAs: 'json' | 'blob' = 'json'
): Promise<T> {
    if (response.status === 401 && retryFn) {
        const newToken = await silentRefresh();
        if (newToken) {
            const retryResponse = await retryFn();
            return handleResponse<T>(retryResponse, undefined, parseAs);
        }
        localStorage.removeItem('token');
        window.location.href = '/';
        throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
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

// Helper to make a fetch call with auth and credentials
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...(options.headers || {}) },
        credentials: "include",
    });
}

export function createPhotobook(title?: string): Promise<{ key: string }> {
    const url = MauMauURL + "/create";
    const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({ title }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function viewPhotobook(photobookId: string): Promise<any> {
    const url = MauMauURL + "/photobook?key=" + photobookId;
    const options: RequestInit = { method: "GET" };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function listPhotobooks(): Promise<any[]> {
    const url = MauMauURL + "/photobooks";
    const options: RequestInit = { method: "GET" };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function deletePhotobook(photobookId: string): Promise<{ success: boolean }> {
    const url = MauMauURL + "/photobook?key=" + photobookId;
    const options: RequestInit = { method: "DELETE" };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function getUploadUrl(
    contentType: string
): Promise<{ uploadUrl: string; finalUrl: string }> {
    const url = `${MauMauURL}/upload-url?contentType=${encodeURIComponent(contentType)}`;
    const options: RequestInit = { method: "GET" };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export async function putFileToBucket(uploadUrl: string, file: Blob, contentType: string): Promise<void> {
    const isLocal = uploadUrl.startsWith('http://localhost') || uploadUrl.startsWith('http://127.0.0.1');
    const fetchFn = isLocal ? authFetch : fetch;
    const response = await fetchFn(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${response.status} ${errorText}`);
    }
}

export function confirmUpload(
    photobookId: string,
    imageUrl: string,
    dropZoneIndex: number,
    pageNumber: number = 1,
    layout: string = 'horizontal-triplet'
): Promise<{ success: boolean; dropZoneIndex: number }> {
    const url = `${MauMauURL}/confirm-upload?key=${photobookId}`;
    const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({ imageUrl, dropZoneIndex, pageNumber, layout }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function removeImage(
    photobookId: string,
    dropZoneIndex: number,
    pageNumber: number = 1
): Promise<{ success: boolean }> {
    const url = `${MauMauURL}/remove-image?key=${photobookId}&dropZoneIndex=${dropZoneIndex}&pageNumber=${pageNumber}`;
    const options: RequestInit = { method: "DELETE" };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function addPage(
    photobookId: string,
    layout: string = 'horizontal-triplet'
): Promise<{ success: boolean; pageNumber: number }> {
    const url = MauMauURL + "/add-page?key=" + photobookId;
    const options: RequestInit = {
        method: "POST",
        body: JSON.stringify({ layout }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function updatePageOrder(
    photobookId: string,
    order: number[]
): Promise<{ success: boolean }> {
    const url = MauMauURL + "/page-order?key=" + photobookId;
    const options: RequestInit = {
        method: "PUT",
        body: JSON.stringify({ order }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function updatePageLayout(
    photobookId: string,
    pageNumber: number,
    layout: string
): Promise<{ success: boolean }> {
    const url = MauMauURL + "/page-layout?key=" + photobookId;
    const options: RequestInit = {
        method: "PUT",
        body: JSON.stringify({ pageNumber, layout }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function updatePhotobookTitle(
    photobookId: string,
    title: string
): Promise<{ success: boolean; title: string }> {
    const url = MauMauURL + "/update-title?key=" + photobookId;
    const options: RequestInit = {
        method: "PUT",
        body: JSON.stringify({ title }),
    };
    return authFetch(url, options).then((response) =>
        handleResponse(response, () => authFetch(url, options))
    );
}

export function generatePDF(photobookId: string): Promise<Blob> {
    const url = MauMauURL + "/generate-pdf?key=" + photobookId;
    const options: RequestInit = { method: "GET" };
    return authFetch(url, options).then((response) =>
        handleResponse<Blob>(response, () => authFetch(url, options), 'blob')
    );
}
