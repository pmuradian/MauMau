import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import { type LayoutType } from "UserInterface/LayoutSelector";

export default function SideContent({ 
    selectedPage, 
    totalPages, 
    onPageSelect, 
    onAddPage,
    pageLayouts
}: {
    selectedPage: number;
    totalPages: number;
    onPageSelect: (page: number) => void;
    onAddPage: () => void;
    pageLayouts: { [pageNumber: number]: LayoutType };
}) {

    const renderMiniPreview = (layout: LayoutType) => {
        switch (layout) {
            case 'horizontal-triplet':
                return (
                    <div className="mini-layout">
                        <div className="mini-row">
                            <div className="mini-dropzone"></div>
                            <div className="mini-dropzone"></div>
                        </div>
                        <div className="mini-dropzone wide"></div>
                    </div>
                );
            case 'vertical-triplet':
                return (
                    <div className="mini-layout vsplit">
                        <div className="mini-column">
                            <div className="mini-dropzone"></div>
                            <div className="mini-dropzone"></div>
                        </div>
                        <div className="mini-dropzone large"></div>
                    </div>
                );
            case 'vertical-arrangement':
                return (
                    <div className="mini-layout vertical">
                        <div className="mini-dropzone"></div>
                        <div className="mini-dropzone"></div>
                    </div>
                );
            case 'horizontal-arrangement':
                return (
                    <div className="mini-layout horizontal">
                        <div className="mini-dropzone"></div>
                        <div className="mini-dropzone"></div>
                    </div>
                );
            case 'single-image':
                return (
                    <div className="mini-layout">
                        <div className="mini-dropzone full"></div>
                    </div>
                );
            default:
                return (
                    <div className="mini-layout">
                        <div className="mini-row">
                            <div className="mini-dropzone"></div>
                            <div className="mini-dropzone"></div>
                        </div>
                        <div className="mini-dropzone wide"></div>
                    </div>
                );
        }
    };

    return (
        <div className="photobook-sidebar">
            <div className="photobook-sidebar-header">
                <h3>Pages</h3>
            </div>
            
            <div className="photobook-pages-container">
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const layout = pageLayouts[pageNumber] ?? 'horizontal-triplet';
                    return (
                        <div
                            key={pageNumber}
                            className={`photobook-page-thumbnail ${selectedPage === pageNumber ? 'active' : ''}`}
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
