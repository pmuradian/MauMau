import { Dropzone, PreviewDropzone } from "uicomponents/Dropzone";
import { dropHandler, type LayoutProps, type PreviewLayoutProps } from "./types";

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
                    onImageDropped={dropHandler(onImageDropped, 0)}
                    onImageRemoved={() => onImageRemoved?.(0)}
                    initialImage={initialImages[0]}
                />
                <Dropzone
                    aspectRatio='0.8'
                    onImageDropped={dropHandler(onImageDropped, 1)}
                    onImageRemoved={() => onImageRemoved?.(1)}
                    initialImage={initialImages[1]}
                />
            </div>
            <Dropzone
                aspectRatio='0.562'
                onImageDropped={dropHandler(onImageDropped, 2)}
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
        <div className='row' style={{paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1', gap: '8px' }}>
            <div className='column' style={{ width: '40%', display: 'flex', flexShrink: 0 }}>
                <PreviewDropzone
                    aspectRatio="0.9"
                    initialImage={initialImages[0]}
                />
                <PreviewDropzone
                    aspectRatio="0.9"
                    initialImage={initialImages[1]}
                />
            </div>
            <PreviewDropzone
                aspectRatio='0.589'
                initialImage={initialImages[2]}
            />
        </div>
    );
}
