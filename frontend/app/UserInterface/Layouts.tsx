import { Dropzone } from "./Dropzone";
import { File } from "./Dropzone"

type DropCoords = { x: number, y: number, width: number, height: number };

export function HorizontalTriplet({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='column' style={{ width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 0); // Top-left dropzone
                        console.log("Image dropped in top-left:", file, merged);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(0);
                        console.log("Image removed from top-left");
                    }}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 1); // Top-right dropzone
                        console.log("Image dropped in top-right:", file, merged);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(1);
                        console.log("Image removed from top-right");
                    }}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                aspectRatio='1.5'
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 2); // Bottom dropzone
                    console.log("Image dropped in bottom:", file, merged);
                }}
                onImageRemoved={() => {
                    onImageRemoved?.(2);
                    console.log("Image removed from bottom");
                }}
                initialImage={initialImages[2]}
            />
        </div>
    );
}

export function VerticalTriplet({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
            <div className='column' style={{ width: '50%', display: 'flex', flex: '1' }}>
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 0);
                    }}
                    onImageRemoved={() => onImageRemoved?.(0)}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 1);
                    }}
                    onImageRemoved={() => onImageRemoved?.(1)}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 2);
                }}
                onImageRemoved={() => onImageRemoved?.(2)}
                initialImage={initialImages[2]}
            />
        </div>
    );
}

export function VerticalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='column' style={{ paddingBottom: '12%', paddingTop: '12%', width: '100%', display: 'flex', flex: '1' }}>
            <Dropzone
            aspectRatio='1.5'
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 0);
                }}
                onImageRemoved={() => onImageRemoved?.(0)}
                initialImage={initialImages[0]}
            />
            <Dropzone
            aspectRatio='1.5'
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 1);
                }}
                onImageRemoved={() => onImageRemoved?.(1)}
                initialImage={initialImages[1]}
            />
        </div>
    );
}

export function HorizontalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='row' style={{ width: '100%', display: 'flex', flex: '1', gap: 8 }}>
            <Dropzone
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 0);
                }}
                onImageRemoved={() => onImageRemoved?.(0)}
                initialImage={initialImages[0]}
            />
            <Dropzone
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 1);
                }}
                onImageRemoved={() => onImageRemoved?.(1)}
                initialImage={initialImages[1]}
            />
        </div>
    );
}

export function SinglePage({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flex: '1' }}>
            <Dropzone
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 0);
                }}
                onImageRemoved={() => onImageRemoved?.(0)}
                initialImage={initialImages[0]}
            />
        </div>
    );
}
