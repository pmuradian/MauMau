import { Dropzone } from "../../Dropzone";
import { File } from "../../Dropzone"

type DropCoords = { x: number, y: number, width: number, height: number };

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