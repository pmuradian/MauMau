import { File } from "uicomponents/Dropzone";

export type DropCoords = { x: number; y: number; width: number; height: number };

export type LayoutProps = {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void;
    onImageRemoved?: (dropZoneIndex: number) => void;
    initialImages?: { [dropZoneIndex: number]: string };
};

export type PreviewLayoutProps = {
    initialImages?: { [dropZoneIndex: number]: string };
};

export function dropHandler(
    onImageDropped: LayoutProps['onImageDropped'],
    dropZoneIndex: number
) {
    return (file: File, coords?: { x: number; y: number }, dimensions?: { width: number; height: number }) => {
        const merged: DropCoords = {
            x: coords?.x ?? 0,
            y: coords?.y ?? 0,
            width: dimensions?.width ?? 0,
            height: dimensions?.height ?? 0,
        };
        onImageDropped?.(file, merged, dropZoneIndex);
    };
}
