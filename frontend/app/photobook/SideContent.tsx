import { useEffect, useRef, type CSSProperties } from "react";
import { PrimaryButton } from "../UserInterface/Buttons";
import { type LayoutType } from "UserInterface/LayoutSelector";
import { 
    PortraitPreviewFullPage, 
    PortraitPreviewHorizontalTriplet, 
    PortraitPreviewSinglePage, 
    PortraitPreviewVerticalTuple, 
    PortraitPreviewVerticalTriplet
 } from "UserInterface/PageLayouts/Portrait";

interface SideContentProps {
    selectedPage: number;
    totalPages: number;
    onPageSelect: (page: number) => void;
    onAddPage: () => void;
    pageLayouts: { [pageNumber: number]: LayoutType };
    pageImages: { [pageNumber: number]: { [dropZoneIndex: number]: string } };
}

const styles: { [key: string]: CSSProperties } = {
    sidebar: {
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        padding: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #dee2e6",
        position: "sticky",
        height: "100vh",
        width: 250,
        flexShrink: 0,
        overflow: "hidden",
    },
    pagesContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        overflowY: "auto",
        paddingRight: 8,
        minHeight: 0,
    },
    pagePreview: {
        width: "100%",
        aspectRatio: "0.7071",
        backgroundColor: "white",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        flexShrink: 0,
        cursor: "pointer",
        border: "2px solid transparent",
        borderRadius: 4,
    },
    pagePreviewSelected: {
        borderColor: "#007acc",
        boxShadow: "0 2px 8px rgba(0, 122, 204, 0.3)",
    },
    sidebarActions: {
        paddingTop: 16,
        borderTop: "2px solid #dee2e6",
        flexShrink: 0,
    },
};

const renderMiniPreview = (layout: LayoutType, images: { [dropZoneIndex: number]: string } = {}) => {
    const layouts = {
        'horizontal-triplet': <PortraitPreviewHorizontalTriplet initialImages={images} />,
        'vertical-triplet': <PortraitPreviewVerticalTriplet initialImages={images} />,
        'vertical-tuple': <PortraitPreviewVerticalTuple initialImages={images} />,
        'full-page': <PortraitPreviewFullPage initialImages={images} />,
        'single-page': <PortraitPreviewSinglePage initialImages={images} />
    };

    return layouts[layout];
};

export default function SideContent({
    selectedPage,
    totalPages,
    onPageSelect,
    onAddPage,
    pageLayouts,
    pageImages,
}: SideContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedPageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !selectedPageRef.current) return;

        const container = containerRef.current;
        const selectedElement = selectedPageRef.current;
        const scrollTop = selectedElement.offsetTop -
            (container.clientHeight / 2) +
            (selectedElement.clientHeight / 2);

        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }, [selectedPage]);

    return (
        <div style={styles.sidebar}>
            <div style={styles.pagesContainer} ref={containerRef}>
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const layout = pageLayouts[pageNumber];
                    const isSelected = pageNumber === selectedPage;
                    return (
                        <div
                            key={pageNumber}
                            ref={isSelected ? selectedPageRef : null}
                            style={{ ...styles.pagePreview, ...(isSelected ? styles.pagePreviewSelected : {}) }}
                            onClick={() => onPageSelect(pageNumber)}
                        >
                            {renderMiniPreview(layout, pageImages[pageNumber])}
                        </div>
                    );
                })}
            </div>

            <div style={styles.sidebarActions}>
                <PrimaryButton onClick={onAddPage}>
                    Add Page
                </PrimaryButton>
            </div>
        </div>
    );
}
