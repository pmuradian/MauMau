import { Dropzone } from "uicomponents/Dropzone";
import { dropHandler, type LayoutProps } from "../Portrait/types";

export function HorizontalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: LayoutProps) {
    return (
        <div className='row' style={{ width: '100%', display: 'flex', flex: '1', gap: 8 }}>
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
    );
}
