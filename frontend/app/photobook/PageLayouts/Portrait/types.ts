import { File } from "../../Dropzone";

export type DropCoords = { x: number; y: number; width: number; height: number };

export type LayoutProps = {
    onImageDropped?: (file: File, coords: DropCoords, dropZoneIndex: number) => void;
    onImageRemoved?: (dropZoneIndex: number) => void;
    initialImages?: { [dropZoneIndex: number]: string };
};

export type PreviewLayoutProps = {
    initialImages?: { [dropZoneIndex: number]: string };
};
