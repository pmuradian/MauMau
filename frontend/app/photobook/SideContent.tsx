import { useEffect, useRef, type CSSProperties } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PrimaryButton } from "../UserInterface/Buttons";
import { type LayoutType } from "UserInterface/LayoutSelector";
import {
    PortraitPreviewFullPage,
    PortraitPreviewHorizontalTriplet,
    PortraitPreviewSinglePage,
    PortraitPreviewVerticalTuple,
    PortraitPreviewVerticalTriplet
 } from "UserInterface/PageLayouts/Portrait";
import SortablePageItem from "./SortablePageItem";

interface SideContentProps {
    selectedPage: number;
    pageOrder: number[];
    onPageSelect: (page: number) => void;
    onAddPage: () => void;
    onReorderPages: (oldIndex: number, newIndex: number) => void;
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
    pageOrder,
    onPageSelect,
    onAddPage,
    onReorderPages,
    pageLayouts,
    pageImages,
}: SideContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = pageOrder.indexOf(Number(active.id));
            const newIndex = pageOrder.indexOf(Number(over.id));
            onReorderPages(oldIndex, newIndex);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const selectedIndex = pageOrder.indexOf(selectedPage);
        const container = containerRef.current;
        const children = container.children;

        if (selectedIndex >= 0 && children[selectedIndex]) {
            const selectedElement = children[selectedIndex] as HTMLElement;
            const scrollTop = selectedElement.offsetTop -
                (container.clientHeight / 2) +
                (selectedElement.clientHeight / 2);

            container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
    }, [selectedPage, pageOrder]);

    const sortableIds = pageOrder.map(String);

    return (
        <div style={styles.sidebar}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    <div style={styles.pagesContainer} ref={containerRef}>
                        {pageOrder.map((pageNumber) => {
                            const layout = pageLayouts[pageNumber];
                            const isSelected = pageNumber === selectedPage;
                            return (
                                <SortablePageItem
                                    key={pageNumber}
                                    id={String(pageNumber)}
                                    isSelected={isSelected}
                                    onClick={() => onPageSelect(pageNumber)}
                                >
                                    {renderMiniPreview(layout, pageImages[pageNumber])}
                                </SortablePageItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>

            <div style={styles.sidebarActions}>
                <PrimaryButton onClick={onAddPage}>
                    Add Page
                </PrimaryButton>
            </div>
        </div>
    );
}
