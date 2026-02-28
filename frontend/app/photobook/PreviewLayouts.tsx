// Re-export all Portrait preview layouts with their original names for backwards compatibility
export {
    PortraitPreviewHorizontalTriplet as PreviewHorizontalTriplet,
    PortraitPreviewVerticalTuple as PreviewVerticalTuple,
    PortraitPreviewSinglePage as PreviewSinglePage,
} from "./PageLayouts/Portrait";

// Also export with Portrait prefix
export {
    PortraitPreviewHorizontalTriplet,
    PortraitPreviewVerticalTuple,
    PortraitPreviewSinglePage,
} from "./PageLayouts/Portrait";

export type { PreviewLayoutProps } from "./PageLayouts/Portrait";
