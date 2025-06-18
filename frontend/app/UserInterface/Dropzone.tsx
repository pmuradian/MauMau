import React, { useCallback, useEffect, useState } from 'react'
import './Styles/paper.css';
import { useDropzone } from 'react-dropzone'

type RationProp = {
    aspectRatio?: string;
}

export class File {
    name: string;
    data: Blob;
    preview: string;

    constructor(
        name: string,
        data: Blob,
        preview: string
    ) {
        this.name = name;
        this.data = data;
        this.preview = preview;
    }
}

export function Dropzone(
    { aspectRatio = '1', onImageDropped = (f) => { } }: { aspectRatio?: string, onImageDropped?: (file: File) => void }
) {

    const [file, setFile] = useState<File | null>(null);
    const onDrop = useCallback((acceptedFiles: (Blob)[]) => {
        const file = acceptedFiles[acceptedFiles.length - 1];
        // Do something with the files
        const image = new File(URL.createObjectURL(file), file, URL.createObjectURL(file))
        setFile(image);
        onImageDropped(image);
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg']
        },
        multiple: false
    });

    const previews = file ? (
        <div style={{ width: '100%', display: 'flex', flex: '1' }}>
            <img
                src={file.preview}
                style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: aspectRatio }}
                onError={(e) => {
                    console.error("Error loading image preview:", e);
                }}
            />
        </div>
    ) : null;

    return (
        <div className="childBorder" style={{ width: '100%', aspectRatio: aspectRatio }}>
            <div className="w-full h-full" {...getRootProps()}>
                <input className="w-full h-full" {...getInputProps()} />
                {
                    file ? <div className="w-full h-full">
                        <div>
                            {previews}
                        </div>
                    </div> : <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </div>
        </div>
    )
}
