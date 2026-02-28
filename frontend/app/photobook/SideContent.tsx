import { useEffect, useRef } from "react";
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
import { PrimaryButton } from "../uicomponents/Buttons";
import { type LayoutType } from "./LayoutSelector";
import {
    PortraitPreviewFullPage,
    PortraitPreviewHorizontalTriplet,
    PortraitPreviewSinglePage,
    PortraitPreviewVerticalTuple,
    PortraitPreviewVerticalTriplet
 } from "./PageLayouts/Portrait";
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
        <div className="photobook-sidebar">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    <div className="photobook-pages-container" ref={containerRef}>
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

            <div className="photobook-sidebar-actions">
                <PrimaryButton onClick={onAddPage}>
                    Add Page
                </PrimaryButton>
            </div>
        </div>
    );
}
