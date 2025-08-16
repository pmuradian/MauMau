import { Dropzone } from "./Dropzone";
import { File } from "./Dropzone"

type DropCoords = { x: number, y: number, width: number, height: number };

export function HorizontalTripplet({
    onImageDropped, 
    onImageRemoved
}: { 
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void,
    onImageRemoved?: (dropZoneIndex: number) => void
}) {
    return (
        <div className='column' style={{paddingTop: '12%', width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <Dropzone 
                    onImageDropped={(file: File, coords?: {x: number, y: number}, dimensions?: {width: number, height: number}) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 0); // Top-left dropzone
                        console.log("Image dropped in top-left:", file, merged);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(0);
                        console.log("Image removed from top-left");
                    }}
                />
                <Dropzone 
                    onImageDropped={(file: File, coords?: {x: number, y: number}, dimensions?: {width: number, height: number}) => {
                        const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                        onImageDropped?.(file, merged, 1); // Top-right dropzone
                        console.log("Image dropped in top-right:", file, merged);
                    }}
                    onImageRemoved={() => {
                        onImageRemoved?.(1);
                        console.log("Image removed from top-right");
                    }}
                />
            </div>
            <Dropzone 
                aspectRatio='1.5' 
                onImageDropped={(file: File, coords?: {x: number, y: number}, dimensions?: {width: number, height: number}) => {
                    const merged = { x: coords?.x ?? 0, y: coords?.y ?? 0, width: dimensions?.width ?? 0, height: dimensions?.height ?? 0 };
                    onImageDropped?.(file, merged, 2); // Bottom dropzone
                    console.log("Image dropped in bottom:", file, merged);
                }}
                onImageRemoved={() => {
                    onImageRemoved?.(2);
                    console.log("Image removed from bottom");
                }}
            />
        </div>
    );
}

export function VerticalTripplet({ children }: { children: React.ReactNode }) {
    return (
        <div className='row' style={{paddingTop: '12%', width: '50%', display: 'flex', flex: '1' }}>
            <div className='column' style={{ width: '50%', display: 'flex', flex: '1' }}>
                <Dropzone></Dropzone>
                <Dropzone></Dropzone>
            </div>
            <Dropzone></Dropzone>
        </div>
    );
}

function VerticalArrangement({ children }: { children: React.ReactNode }) {
    return (
        <div className='column' style={{paddingTop: '12%', width: '100%', display: 'flex', flex: '1' }}>
            <Dropzone></Dropzone>
            <Dropzone></Dropzone>
        </div>
    );
}
function HorizontalArrangement({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row items-center justify-center gap-4">
            {children}
        </div>
    );
}
