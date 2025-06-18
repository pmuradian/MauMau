import { on } from "events";
import { Dropzone } from "./Dropzone";
import { File } from "./Dropzone"

export function HorizontalTripplet({onImageDropped}: { onImageDropped?: (file: File) => void }) {
    return (
        <div className='column' style={{paddingTop: '12%', width: '100%', display: 'flex', flex: '1' }}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1' }}>
                <Dropzone onImageDropped = {(file: File) => {
                    onImageDropped?.(file);
                    console.log("Image dropped:", file);
                }}></Dropzone>
                <Dropzone onImageDropped = {(file: File) => {
                    onImageDropped?.(file);
                    console.log("Image dropped:", file);
                }}></Dropzone>
            </div>
            <Dropzone aspectRatio = '1.5' onImageDropped = {(file: File) => {
                onImageDropped?.(file);
                console.log("Image dropped:", file);
            }}></Dropzone>
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
