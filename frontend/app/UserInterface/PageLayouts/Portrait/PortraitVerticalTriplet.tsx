import { Dropzone, File, PreviewDropzone } from "../../Dropzone";
import type { LayoutProps, PreviewLayoutProps } from "./types";

export function PortraitVerticalTriplet({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div className='row' style={{ width: '100%', display: 'flex', flex: '1', gap: '8px' }}>
            <div className='column' style={{ width: '40%', display: 'flex', flexShrink: 0 }}>
                <Dropzone
                    aspectRatio='0.8'
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 0);
                    }}
                    onImageRemoved={() => onImageRemoved?.(0)}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    aspectRatio='0.8'
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 1);
                    }}
                    onImageRemoved={() => onImageRemoved?.(1)}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                aspectRatio='0.562'
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

export function PortraitPreviewVerticalTriplet({
    initialImages = {}
}: PreviewLayoutProps) {
    return (
        <div className='row' style={{ width: '100%', display: 'flex', flex: '1', gap: '8px' }}>
            <div className='column' style={{ width: '40%', display: 'flex', flexShrink: 0 }}>
                <PreviewDropzone
                    aspectRatio="0.8"
                    initialImage={initialImages[0]}
                />
                <PreviewDropzone
                    aspectRatio="0.8"
                    initialImage={initialImages[1]}
                />
            </div>
            <PreviewDropzone
                aspectRatio='0.562'
                initialImage={initialImages[2]}
            />
        </div>
    );
}