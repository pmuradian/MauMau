import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface SortablePageItemProps {
    id: string;
    isSelected: boolean;
    onClick: () => void;
    children: ReactNode;
}

const styles: { [key: string]: CSSProperties } = {
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
        cursor: "grab",
        border: "2px solid transparent",
        borderRadius: 4,
        touchAction: "none",
    },
    pagePreviewSelected: {
        borderColor: "#007acc",
        boxShadow: "0 2px 8px rgba(0, 122, 204, 0.3)",
    },
    pagePreviewDragging: {
        opacity: 0.5,
        cursor: "grabbing",
    },
};

export default function SortablePageItem({
    id,
    isSelected,
    onClick,
    children,
}: SortablePageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: CSSProperties = {
        ...styles.pagePreview,
        ...(isSelected ? styles.pagePreviewSelected : {}),
        ...(isDragging ? styles.pagePreviewDragging : {}),
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
}
