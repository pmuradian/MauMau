import { Dropzone, File, PreviewDropzone } from "../../Dropzone";
import type { LayoutProps, PreviewLayoutProps } from "./types";

export function PortraitFullPage({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flex: '1' }}>
            <Dropzone
                // aspectRatio='0.7'
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

export function PortraitPreviewFullPage({
    initialImages = {}
}: PreviewLayoutProps) {
    return (
        <div style={{ paddingLeft: '10%', width: '100%', height: '100%', display: 'flex', flex: '1' }}>
            <PreviewDropzone
                // aspectRatio="0.7"
                initialImage={initialImages[0]}
            />
        </div>
    );
}