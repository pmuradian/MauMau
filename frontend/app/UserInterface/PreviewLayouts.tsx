import { Dropzone, PreviewDropzone } from "./Dropzone";
import { File } from "./Dropzone"

type DropCoords = { x: number, y: number, width: number, height: number };

export function PreviewHorizontalTriplet({
    initialImages = {}
}: {
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='column' style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1'}}>
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

export function PreviewVerticalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
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

export function PreviewHorizontalTuple({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div className='row' style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', display: 'flex', flex: '1', gap: 8 }}>
            <Dropzone
                initialImage={initialImages[0]}
            />
            <Dropzone
                initialImage={initialImages[1]}
            />
        </div>
    );
}

export function PreviewSinglePage({
    onImageDropped,
    onImageRemoved,
    initialImages = {}
}: {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void,
    initialImages?: { [dropZoneIndex: number]: string }
}) {
    return (
        <div style={{ paddingLeft: '10%', paddingRight: '5%', width: '100%', height: '100%', display: 'flex', flex: '1' }}>
            <Dropzone
                initialImage={initialImages[0]}
            />
        </div>
    );
}

// export function VerticalTriplet({
//     onImageDropped,
//     onImageRemoved,
//     initialImages = {}
// }: {
//     onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
//     onImageRemoved?: (dropZoneIndex: number) => void,
//     initialImages?: { [dropZoneIndex: number]: string }
// }) {
//     return (
//         <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
//             <div className='column' style={{ width: '50%', display: 'flex', flex: '1' }}>
//                 <PreviewDropzone
//                     initialImage={initialImages[0]}
//                 />
//                 <PreviewDropzone
//                     initialImage={initialImages[1]}
//                 />
//             </div>
//             <PreviewDropzone
//                 initialImage={initialImages[2]}
//             />
//         </div>
//     );
// }