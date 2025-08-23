import { useEffect, useRef } from "react";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import { type LayoutType } from "UserInterface/LayoutSelector";

interface SideContentProps {
    selectedPage: number;
    totalPages: number;
    onPageSelect: (page: number) => void;
    onAddPage: () => void;
    pageLayouts: { [pageNumber: number]: LayoutType };
    title?: string;
    description?: string;
    isEditingTitle?: boolean;
    editedTitle?: string;
    onEditedTitleChange?: (value: string) => void;
    onSaveTitle?: () => void;
    onBeginEdit?: () => void;
    onCancelEdit?: () => void;
}

export default function SideContent({
    selectedPage,
    totalPages,
    onPageSelect,
    onAddPage,
    pageLayouts,
    title,
    description,
    isEditingTitle,
    editedTitle,
    onEditedTitleChange,
    onSaveTitle,
    onBeginEdit,
    onCancelEdit
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

    const renderMiniPreview = (layout: LayoutType) => {
        const layouts = {
            'horizontal-triplet': (
                <div className="a4-page mini-layout">
                    <div className="mini-row">
                        <div className="mini-dropzone" />
                        <div className="mini-dropzone" />
                    </div>
                    <div className="mini-dropzone wide" />
                </div>
            ),
            'vertical-triplet': (
                <div className="a4-page mini-layout vsplit">
                    <div className="mini-column">
                        <div className="mini-dropzone" />
                        <div className="mini-dropzone" />
                    </div>
                    <div className="mini-dropzone large" />
                </div>
            ),
            'vertical-arrangement': (
                <div className="a4-page mini-layout vertical">
                    <div className="mini-dropzone" />
                    <div className="mini-dropzone" />
                </div>
            ),
            'horizontal-arrangement': (
                <div className="a4-page mini-layout horizontal">
                    <div className="mini-dropzone" />
                    <div className="mini-dropzone" />
                </div>
            ),
            'single-image': (
                <div className="a4-page mini-layout">
                    <div className="mini-dropzone" />
                </div>
            )
        };

        return layouts[layout] || layouts['horizontal-triplet'];
    };

    return (
        <div className="photobook-sidebar">
            <div className="photobook-sidebar-header">
                {title && (
                    <div className="photobook-header-in-sidebar">
                        {isEditingTitle ? (
                            <div className="photobook-title-edit-container">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => onEditedTitleChange?.(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onSaveTitle?.();
                                        } else if (e.key === "Escape") {
                                            onCancelEdit?.();
                                        }
                                    }}
                                    className="photobook-title-input"
                                    autoFocus
                                />
                                <div className="photobook-title-buttons">
                                    <button onClick={onSaveTitle} className="photobook-title-button save">
                                        Save
                                    </button>
                                    <button onClick={onCancelEdit} className="photobook-title-button cancel">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <h1
                                className="photobook-title"
                                onClick={onBeginEdit}
                                title="Click to edit title"
                            >
                                {title}
                            </h1>
                        )}
                        {description && <p className="photobook-description">{description}</p>}
                        <div className="photobook-page-indicator">
                            Page {selectedPage} of {totalPages}
                        </div>
                    </div>
                )}
                <h3>Pages</h3>
            </div>

            <div className="photobook-pages-container" ref={containerRef}>
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const layout = pageLayouts[pageNumber] ?? 'horizontal-triplet';
                    const isSelected = selectedPage === pageNumber;
                    return (
                        <div
                            key={pageNumber}
                            ref={isSelected ? selectedPageRef : null}
                            className={`a4-page photobook-page-thumbnail${isSelected ? '-active' : ''}`}
                            title={`Page ${pageNumber}`}
                            onClick={() => onPageSelect(pageNumber)}
                        >
                            <div className="photobook-page-number">{pageNumber}</div>
                            <div className="photobook-page-preview">
                                {renderMiniPreview(layout)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="photobook-sidebar-actions">
                <PrimaryButton onClick={onAddPage}>
                    Add Page
                </PrimaryButton>
            </div>
        </div>
    );
}
