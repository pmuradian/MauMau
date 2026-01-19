import { Dropzone, File, PreviewDropzone } from "../../Dropzone";
import type { LayoutProps, PreviewLayoutProps } from "./types";

export function PortraitVerticalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
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

export function PortraitPreviewVerticalTuple({
    initialImages = {}
}: PreviewLayoutProps) {
    return (
        <div className='column' style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1' }}>
            <PreviewDropzone
                aspectRatio='1.5'
                initialImage={initialImages[0]}
            />
            <PreviewDropzone
                aspectRatio='1.5'
                initialImage={initialImages[1]}
            />
        </div>
    );
}