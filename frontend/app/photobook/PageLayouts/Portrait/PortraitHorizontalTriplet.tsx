import { Dropzone, File, PreviewDropzone } from "uicomponents/Dropzone";
import type { LayoutProps, PreviewLayoutProps } from "./types";

export function PortraitHorizontalTriplet({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div className='column' style={{ width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 0);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(0);
                    }}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 1);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(1);
                    }}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                aspectRatio='1.5'
                onImageDropped={(file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 2);
                }}
                onImageRemoved={() => {
                    onImageRemoved?.(2);
                }}
                initialImage={initialImages[2]}
            />
        </div>
    );
}

export function PortraitPreviewHorizontalTriplet({
    initialImages = {}
}: PreviewLayoutProps) {
    return (
        <div className='column' style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <PreviewDropzone
                    aspectRatio="1"
                    initialImage={initialImages[0]}
                />
                <PreviewDropzone
                    aspectRatio="1"
                    initialImage={initialImages[1]}
                />
            </div>
            <PreviewDropzone
                aspectRatio='1.5'
                initialImage={initialImages[2]}
            />
        </div>
    );
}