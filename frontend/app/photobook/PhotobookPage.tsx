import { A4Portrait } from "./Pages";
import {
  PortraitHorizontalTriplet as HorizontalTriplet,
  PortraitVerticalTriplet as VerticalTriplet,
  PortraitVerticalTuple as VerticalTuple,
  PortraitSinglePage as SinglePage,
  PortraitFullPage as FullPage,
} from "./PageLayouts/Portrait";
import { File } from "uicomponents/Dropzone";
import { type DropCoords } from "./PageLayouts/Portrait/types";
import { getUploadUrl, putFileToBucket, confirmUpload, removeImage } from "networking/NetworkService";
import { type LayoutType } from "./LayoutSelector";
import { useToast } from "../contexts/ToastContext";

export default function PhotobookPage({
  photobookKey,
  selectedPage,
  images,
  onImageUpdated,
  onImageRemovedLocal,
  layout,
}: {
  photobookKey: string;
  selectedPage: number;
  images: { [dropZoneIndex: number]: string };
  onImageUpdated: (dropZoneIndex: number, dataUrl: string) => void;
  onImageRemovedLocal: (dropZoneIndex: number) => void;
  layout: LayoutType;
}) {
  const { showError } = useToast();
  const handleDrop = async (file: File, _coords: DropCoords, dropZoneIndex: number) => {
    const contentType = file.data.type || 'image/jpeg';
    try {
      const { uploadUrl, finalUrl } = await getUploadUrl(contentType);
      await putFileToBucket(uploadUrl, file.data, contentType);
      await confirmUpload(photobookKey, finalUrl, dropZoneIndex, selectedPage, layout);
      onImageUpdated(dropZoneIndex, finalUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Failed to upload image. Please try again.");
    }
  };

  const handleRemove = (dropZoneIndex: number) => {
    onImageRemovedLocal(dropZoneIndex);
    removeImage(photobookKey, dropZoneIndex, selectedPage).catch((error) => {
      console.error("Error removing image from server:", error);
    });
  };

  const renderLayout = () => {
    switch (layout) {
      case "horizontal-triplet":
        return (
          <HorizontalTriplet
            key={selectedPage}
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "vertical-triplet":
        return (
          <VerticalTriplet
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "vertical-tuple":
        return (
          <VerticalTuple
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "single-page":
        return (
          <SinglePage
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "full-page":
        return (
          <FullPage
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="photobook-paper-container">
      <A4Portrait>{renderLayout()}</A4Portrait>
    </div>
  );
}
