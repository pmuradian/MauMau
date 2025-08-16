import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import { useEffect, useState } from "react";
import { viewPhotobook, uploadImage, generatePDF, removeImage, updatePhotobookTitle } from "networking/NetworkService";
import { HorizontalTripplet } from "UserInterface/Layouts";
import { A4Portrait } from "UserInterface/Pages";
import { File } from "UserInterface/Dropzone";
import "./photobook.css";

class PhotobookData {
    constructor(
        public title: string = "",
        public description: string = "",
        public images: string[] = []
    ) { }
}

export default function Photobook() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState({} as PhotobookData);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const photobookKey = searchParams.get("key") || "";

    useEffect(() => {
        if (photobookKey) {
            viewPhotobook(photobookKey)
                .then((response) => {
                    console.log("Photobook details:", response);
                    setData(new PhotobookData(
                        response.title || "Untitled Photobook",
                        response.description || "No description available",
                        response.images || []
                    ));
                })
                .catch((error) => {
                    console.error("Error fetching photobook:", error);
                });
        } else {
            console.log("No photobook key found.");
            setData({} as PhotobookData);
        }
    }, [photobookKey]);

    const handleSaveTitle = async () => {
        if (editedTitle.trim() && editedTitle !== data.title) {
            try {
                await updatePhotobookTitle(photobookKey, editedTitle.trim());
                setData(prev => ({ ...prev, title: editedTitle.trim() }));
                console.log("Title updated successfully");
            } catch (error) {
                console.error("Error updating title:", error);
                alert("Failed to update title. Please try again.");
            }
        }
        setIsEditingTitle(false);
    };

    return (
        <div className="photobook-container">
            <SideContent />

            <div className="photobook-main-content">
                {data.title && (
                    <div>
                        {isEditingTitle ? (
                            <div className="photobook-title-edit-container">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSaveTitle();
                                        } else if (e.key === 'Escape') {
                                            setIsEditingTitle(false);
                                            setEditedTitle(data.title);
                                        }
                                    }}
                                    className="photobook-title-input"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveTitle}
                                    className="photobook-title-button save"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingTitle(false);
                                        setEditedTitle(data.title);
                                    }}
                                    className="photobook-title-button cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <h1 
                                className="photobook-title"
                                onClick={() => {
                                    setIsEditingTitle(true);
                                    setEditedTitle(data.title);
                                }}
                                title="Click to edit title"
                            >
                                {data.title}
                            </h1>
                        )}
                        <p className="photobook-description">{data.description}</p>
                    </div>
                )}

                <div className="photobook-paper-container">
                    <A4Portrait>
                        <HorizontalTripplet 
                            onImageDropped={(file: File, coords, dropZoneIndex) => {
                                console.log("Image dropped:", file, coords, "in dropzone:", dropZoneIndex);
                                var reader = new FileReader();
                                reader.readAsDataURL(file.data);
                                reader.onload = () => {
                                    // Include dropzone index in the coordinates
                                    const coordsWithDropzone = { ...coords, dropZoneIndex };
                                    uploadImage(photobookKey, reader.result as string, coordsWithDropzone);
                                };
                                reader.onerror = error => {
                                    console.log("Error: ", error);
                                };
                            }}
                            onImageRemoved={(dropZoneIndex) => {
                                console.log("Removing image from dropzone:", dropZoneIndex);
                                removeImage(photobookKey, dropZoneIndex)
                                    .then(() => {
                                        console.log("Image removed successfully");
                                    })
                                    .catch((error) => {
                                        console.error("Error removing image:", error);
                                    });
                            }}
                        />
                    </A4Portrait>
                </div>

                <div className="photobook-controls">
                    <PrimaryButton onClick={async () => {
                        console.log("Print button clicked");
                        try {
                            const pdfBlob = await generatePDF(photobookKey);
                            
                            // Create download link
                            const url = window.URL.createObjectURL(pdfBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${data.title || 'photobook'}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            console.log("PDF generated and download started");
                        } catch (error) {
                            console.error("Error generating PDF:", error);
                            alert("Failed to generate PDF. Please try again.");
                        }
                    }}>
                        PRINT
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

function SideContent() {
    return (
        <div className="photobook-sidebar">
            <div className="photobook-page-thumbnail active" title="Page 1"></div>
            <div className="photobook-page-thumbnail" title="Page 2"></div>
            <div className="photobook-page-thumbnail" title="Page 3"></div>

            <PrimaryButton onClick={() => {
                console.log("Add page clicked");
            }}>
                Add Page
            </PrimaryButton>
        </div>
    );
}