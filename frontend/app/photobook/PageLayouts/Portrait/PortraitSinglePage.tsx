import { Dropzone, PreviewDropzone } from "uicomponents/Dropzone";
import { dropHandler, type LayoutProps, type PreviewLayoutProps } from "./types";

export function PortraitSinglePage({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div style={{ width: '100%', display: 'flex', flex: '1' }}>
            <Dropzone
                aspectRatio='0.7'
                onImageDropped={dropHandler(onImageDropped, 0)}
                onImageRemoved={() => onImageRemoved?.(0)}
                initialImage={initialImages[0]}
            />
        </div>
    );
}

export function PortraitPreviewSinglePage({
    initialImages = {}
}: PreviewLayoutProps) {
    return (
        <div style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1' }}>
            <PreviewDropzone
                aspectRatio="0.7"
                initialImage={initialImages[0]}
            />
        </div>
    );
}
