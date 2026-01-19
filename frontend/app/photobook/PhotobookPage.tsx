import React from "react";
import { A4Portrait } from "UserInterface/Pages";
import {
  PortraitHorizontalTriplet as HorizontalTriplet,
  PortraitVerticalTriplet as VerticalTriplet,
  PortraitVerticalTuple as VerticalTuple,
  PortraitSinglePage as SinglePage,
} from "UserInterface/PageLayouts/Portrait";
import { File } from "UserInterface/Dropzone";
import { uploadImage, removeImage } from "networking/NetworkService";
import { type LayoutType } from "UserInterface/LayoutSelector";

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
  const handleDrop = (file: File, coords: any, dropZoneIndex: number) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.data);
    reader.onload = () => {
      const coordsWithDropzone = {
        ...(coords || {}),
        dropZoneIndex,
        pageNumber: selectedPage,
      } as any;
      uploadImage(photobookKey, reader.result as string, coordsWithDropzone)
        .then(() => {
          onImageUpdated(dropZoneIndex!, reader.result as string);
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
        });
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  };

  const handleRemove = (dropZoneIndex: number) => {
    removeImage(photobookKey, dropZoneIndex)
      .then(() => {
        onImageRemovedLocal(dropZoneIndex);
      })
      .catch((error) => {
        console.error("Error removing image:", error);
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
      case "vertical-arrangement":
        return (
          <VerticalTuple
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "single-image":
        return (
          <SinglePage
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
