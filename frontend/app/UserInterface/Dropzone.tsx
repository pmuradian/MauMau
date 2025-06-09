import React, { useCallback, useEffect, useState } from 'react'
import './Styles/paper.css';
import { useDropzone } from 'react-dropzone'

type RationProp = {
    aspectRatio?: string;
}

class File {
    name: string;
    data: Blob | MediaSource;
    preview: string;

    constructor(
        name: string,
        data: Blob | MediaSource,
        preview: string
    ) { 
        this.name = name;
        this.data = data;
        this.preview = preview;
    }
}

export function Dropzone({ aspectRatio = '1' }: RationProp) {

    const [file, setFile] = useState<File | null>(null);
    const onDrop = useCallback((acceptedFiles: (Blob | MediaSource)[]) => {
        const file = acceptedFiles[acceptedFiles.length - 1];
        const a = 
        // Do something with the files
        setFile(new File(
            URL.createObjectURL(file),
            file, // Assuming file is a Blob or MediaSource
            URL.createObjectURL(file) // Create a preview URL for the file
        ));
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg'] // Accept common image formats
        },
        multiple: false // Allow multiple files to be dropped
    });

    const previews = file ? (
        <div style={{ width: '100%', display: 'flex', flex: '1' }}>
            <img
                src={file.preview}
                // aspect fill style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: aspectRatio }}
                // Revoke object URL when image fails to load (e.g., if it's not a valid image)
                onError={(e) => {
                    console.error("Error loading image preview:", e);
                    // Optionally remove the problematic file from state
                    // setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
                }}
            />
        </div>
    ) : null;

    return (
        <div className="childBorder" style={{ width: '100%', aspectRatio: aspectRatio }}>
            <div className="w-full h-full" {...getRootProps()}>
                <input className="w-full h-full" {...getInputProps()} />
                {
                    file ?
                        null : <p>Drag 'n' drop some files here, or click to select files</p>
                }
                {
                    file ? (
                        <div className="w-full h-full">
                            <div>
                                {previews}
                            </div>
                        </div>
                    ) : null
                }
            </div>
        </div>
    )
}
