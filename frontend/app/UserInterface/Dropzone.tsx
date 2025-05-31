import React, { useCallback, useEffect, useState } from 'react'
import './Styles/paper.css';
import { useDropzone } from 'react-dropzone'

export function Dropzone() {

    const [files, setFiles] = useState([]);
    const onDrop = useCallback((acceptedFiles: (Blob | MediaSource)[]) => {
        // Do something with the files
        setFiles(prevFiles => [
            ...prevFiles, // Keep existing files
            ...acceptedFiles.map((file: Blob | MediaSource) => Object.assign(file, {
                preview: URL.createObjectURL(file) // Create a URL for image preview
            }))
        ]);
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg'] // Accept common image formats
        },
        multiple: false // Allow multiple files to be dropped
    });

    const previews = files.map(file => (
        <div key={file.name} className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md">
            <img
                src={file.preview}
                className="absolute inset-0 w-full h-full object-cover"
                alt={file.name}
                // Revoke object URL when image fails to load (e.g., if it's not a valid image)
                onError={(e) => {
                    console.error("Error loading image preview:", e);
                    // Optionally remove the problematic file from state
                    setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
                }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs text-center p-1 truncate">{file.name}</p>
            </div>
        </div>
    ));

    return (
        <div className="childBorder" style={{ width: '100%', aspectRatio: '1/1'}}>

        </div>
        // <div {...getRootProps()}>
        //     <input {...getInputProps()} />
        //     {
        //         isDragActive ?
        //             <p>Drop the files here ...</p> :
        //             <p>Drag 'n' drop some files here, or click to select files</p>
        //     }
        //     {
        //         files.length > 0 && (
        //             <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-lg">
        //                 <div className="flex flex-wrap">
        //                     {previews}
        //                 </div>
        //             </div>
        //         )
        //     }
        // </div>
    )
}

export function HorizontalTripplet() {
    return (
        <div className='column' style={{ width: '100%', display: 'flex', flex: '1'}}>
            <div className='row' style={{ width: '100%', display: 'flex', flex: '1'}}>
                <Dropzone></Dropzone>
                <Dropzone></Dropzone>
            </div>
            <Dropzone></Dropzone>
        </div>
    );
}

export function VerticalTripplet({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {children}
        </div>
    );
}

function VerticalArrangement({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {children}
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
