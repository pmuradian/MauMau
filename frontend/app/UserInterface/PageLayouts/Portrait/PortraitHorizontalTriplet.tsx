import { Dropzone, File, PreviewDropzone } from "../../Dropzone";
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
                        onImageDropped?.(file, merged, 1);
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
                    onImageDropped?.(file, merged, 2);
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