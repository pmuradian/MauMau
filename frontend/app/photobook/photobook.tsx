import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import { useEffect, useState } from "react";
import { viewPhotobook, uploadImage, generatePDF, removeImage, updatePhotobookTitle } from "networking/NetworkService";
import { HorizontalTripplet } from "UserInterface/Layouts";
import { A4Portrait } from "UserInterface/Pages";
import { File } from "UserInterface/Dropzone";
import { LayoutSelector, type LayoutType } from "UserInterface/LayoutSelector";
import "./photobook.css";

class PhotobookData {
    constructor(
        public title: string = "",
        public description: string = "",
        public images: string[] = [],
        public pages: PageData[] = []
    ) { }
}

class PageData {
    constructor(
        public pageNumber: number,
        public images: { [dropZoneIndex: number]: string } = {},
        public layout: LayoutType = 'horizontal-triplet'
    ) { }
}

export default function Photobook() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({} as PhotobookData);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [selectedPage, setSelectedPage] = useState(1);
    const [pageData, setPageData] = useState<{ [pageNumber: number]: PageData }>({});
    const [totalPages, setTotalPages] = useState(3); // Default to 3 pages for now
    const [showLayoutSelector, setShowLayoutSelector] = useState(false);
    const photobookKey = searchParams.get("key") || "";

    // Initialize page data for all pages
    useEffect(() => {
        const initialPageData: { [pageNumber: number]: PageData } = {};
        for (let i = 1; i <= totalPages; i++) {
            if (!pageData[i]) {
                initialPageData[i] = new PageData(i);
            } else {
                initialPageData[i] = pageData[i];
            }
        }
        setPageData(initialPageData);
    }, [totalPages]);

    const handleAddPage = (layout: LayoutType) => {
        const newPageNumber = totalPages + 1;
        setTotalPages(newPageNumber);
        setPageData(prev => ({
            ...prev,
            [newPageNumber]: new PageData(newPageNumber, {}, layout)
        }));
        setSelectedPage(newPageNumber);
    };

    useEffect(() => {
        if (photobookKey) {
            viewPhotobook(photobookKey)
                .then((response) => {
                    console.log("Photobook details:", response);
                    setData(new PhotobookData(
                        response.title || "Untitled Photobook",
                        response.description || "No description available",
                        response.images || [],
                        response.pages || []
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
            <SideContent 
                selectedPage={selectedPage}
                totalPages={totalPages}
                onPageSelect={setSelectedPage}
                onAddPage={() => setShowLayoutSelector(true)}
            />

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
                        <div className="photobook-page-indicator">
                            Page {selectedPage} of {totalPages}
                        </div>
                    </div>
                )}

                <div className="photobook-paper-container">
                    <A4Portrait>
                        <HorizontalTripplet 
                            key={selectedPage} // Force re-render when page changes
                            onImageDropped={(file: File, coords, dropZoneIndex) => {
                                console.log(`Image dropped on page ${selectedPage}:`, file, coords, "in dropzone:", dropZoneIndex);
                                var reader = new FileReader();
                                reader.readAsDataURL(file.data);
                                reader.onload = () => {
                                    // Include page number and dropzone index in the coordinates
                                    const coordsWithDropzone = { ...coords, dropZoneIndex, pageNumber: selectedPage };
                                    uploadImage(photobookKey, reader.result as string, coordsWithDropzone)
                                        .then(() => {
                                            // Update local page data
                                            setPageData(prev => ({
                                                ...prev,
                                                [selectedPage]: {
                                                    ...prev[selectedPage],
                                                    images: {
                                                        ...prev[selectedPage]?.images,
                                                        [dropZoneIndex]: reader.result as string
                                                    }
                                                }
                                            }));
                                        });
                                };
                                reader.onerror = error => {
                                    console.log("Error: ", error);
                                };
                            }}
                            onImageRemoved={(dropZoneIndex) => {
                                console.log(`Removing image from page ${selectedPage}, dropzone:`, dropZoneIndex);
                                removeImage(photobookKey, dropZoneIndex)
                                    .then(() => {
                                        console.log("Image removed successfully");
                                        // Update local page data
                                        setPageData(prev => {
                                            const newPageData = { ...prev };
                                            if (newPageData[selectedPage]) {
                                                const newImages = { ...newPageData[selectedPage].images };
                                                delete newImages[dropZoneIndex];
                                                newPageData[selectedPage] = {
                                                    ...newPageData[selectedPage],
                                                    images: newImages
                                                };
                                            }
                                            return newPageData;
                                        });
                                    })
                                    .catch((error) => {
                                        console.error("Error removing image:", error);
                                    });
                            }}
                            initialImages={pageData[selectedPage]?.images || {}}
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

            <LayoutSelector
                isOpen={showLayoutSelector}
                onClose={() => setShowLayoutSelector(false)}
                onSelectLayout={handleAddPage}
            />
        </div>
    );
}

function SideContent({ 
    selectedPage, 
    totalPages, 
    onPageSelect, 
    onAddPage 
}: {
    selectedPage: number;
    totalPages: number;
    onPageSelect: (page: number) => void;
    onAddPage: () => void;
}) {
    return (
        <div className="photobook-sidebar">
            <div className="photobook-sidebar-header">
                <h3>Pages</h3>
            </div>
            
            <div className="photobook-pages-container">
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <div
                            key={pageNumber}
                            className={`photobook-page-thumbnail ${selectedPage === pageNumber ? 'active' : ''}`}
                            title={`Page ${pageNumber}`}
                            onClick={() => onPageSelect(pageNumber)}
                        >
                            <div className="photobook-page-number">{pageNumber}</div>
                            <div className="photobook-page-preview">
                                {/* Mini preview matching HorizontalTripplet layout */}
                                <div className="mini-layout">
                                    <div className="mini-row">
                                        <div className="mini-dropzone"></div>
                                        <div className="mini-dropzone"></div>
                                    </div>
                                    <div className="mini-dropzone wide"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="photobook-sidebar-actions">
                <PrimaryButton onClick={() => {
                    console.log("Add page clicked");
                    onAddPage();
                }}>
                    Add Page
                </PrimaryButton>
            </div>
        </div>
    );
}