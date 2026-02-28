import { Dropzone, PreviewDropzone } from "uicomponents/Dropzone";
import { dropHandler, type LayoutProps, type PreviewLayoutProps } from "./types";

export function PortraitHorizontalTriplet({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div className='column' style={{ width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <Dropzone
                    onImageDropped={dropHandler(onImageDropped, 0)}
                    onImageRemoved={() => onImageRemoved?.(0)}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    onImageDropped={dropHandler(onImageDropped, 1)}
                    onImageRemoved={() => onImageRemoved?.(1)}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                aspectRatio='1.5'
                onImageDropped={dropHandler(onImageDropped, 2)}
                onImageRemoved={() => onImageRemoved?.(2)}
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
