import React, { useCallback, useEffect, useState } from 'react'
import './Styles/paper.css';
import { useDropzone } from 'react-dropzone'

type RationProp = {
    aspectRatio?: string;
}

class File {
    constructor(
        name: string,
        preview: URL
    ) { }
}

export function Dropzone({ aspectRatio = '1' }: RationProp) {

    const [files, setFiles] = useState<((Blob | MediaSource) & { preview: string;})[]>([]);
    const onDrop = useCallback((acceptedFiles: (Blob | MediaSource)[]) => {
        const file = acceptedFiles[acceptedFiles.length - 1];
        const a = Object.assign(file, { preview: URL.createObjectURL(file) })
        // Do something with the files
        setFiles([a]);
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg'] // Accept common image formats
        },
        multiple: false // Allow multiple files to be dropped
    });

    const previews = files.map(file => (
        <div key={file.name} style={{ width: '100%', display: 'flex', flex: '1' }}>
            <img
                src={file.preview}
                // aspect fill style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: aspectRatio }}
                // Revoke object URL when image fails to load (e.g., if it's not a valid image)
                onError={(e) => {
                    console.error("Error loading image preview:", e);
                    // Optionally remove the problematic file from state
                    setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
                }}
            />
        </div>
    ));

    return (
        <div className="childBorder" style={{ width: '100%', aspectRatio: aspectRatio }}>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag 'n' drop some files here, or click to select files</p>
                }
                {
                    files.length > 0 && (
                        <div className="w-full">
                            <div>
                                {previews}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
