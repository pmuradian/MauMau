import { useCallback, useState } from 'react'
import './Styles/paper.css';
import './Styles/dropzone.css';
import { useDropzone } from 'react-dropzone'



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
    { aspectRatio = '1', onImageDropped = () => { }, onImageRemoved = () => { } }: {
        aspectRatio?: string,
        onImageDropped?: (file: File, coords?: { x: number, y: number }, dimensions?: { width: number, height: number }) => void,
        onImageRemoved?: () => void
    }
) {

    const [file, setFile] = useState<File | null>(null);
    const onDrop = useCallback((acceptedFiles: (Blob)[], event?: any) => {
        const file = acceptedFiles[acceptedFiles.length - 1];
        const image = new File(URL.createObjectURL(file), file, URL.createObjectURL(file));
        setFile(image);

        // Get drop coordinates
        let coords = { x: 0, y: 0 };
        if (event && event.type === 'drop' && event.clientX !== undefined && event.clientY !== undefined) {
            coords = { x: event.clientX, y: event.clientY };
        }

        // Get image dimensions
        const img = new window.Image();
        img.onload = function () {
            const dimensions = { width: img.width, height: img.height };
            onImageDropped(image, coords, dimensions);
        };
        img.src = image.preview;
    }, [onImageDropped])

    const handleRemoveImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        onImageRemoved();
    }, [onImageRemoved]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif', '.webp', '.svg']
        },
        multiple: false
    });

    const dropzoneClasses = `dropzone ${isDragActive ? 'drag-active' : ''}`;

    return (
        <div
            className={dropzoneClasses}
            style={{ aspectRatio: aspectRatio }}
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            {file ? (
                <div className="dropzone-image-container">
                    <img
                        src={file.preview}
                        className="dropzone-image"
                        onError={(e) => {
                            console.error("Error loading image preview:", e);
                        }}
                    />
                    <button
                        className="dropzone-remove-button"
                        onClick={handleRemoveImage}
                        title="Remove image"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div className="dropzone-empty-state">
                    <div className="dropzone-plus-icon">+</div>
                    <p className="dropzone-text">
                        {isDragActive ? 'Drop image here' : 'Drop image or click to select'}
                    </p>
                </div>
            )}
        </div>
    )
}
