import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";

interface SortablePageItemProps {
    id: string;
    isSelected: boolean;
    onClick: () => void;
    children: ReactNode;
}

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

    const className = [
        'page-item',
        isSelected ? 'page-item--selected' : '',
        isDragging ? 'page-item--dragging' : '',
    ].filter(Boolean).join(' ');

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            className={className}
            style={style}
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
}
