import React from "react";
import { A4Portrait } from "UserInterface/Pages";
import {
  HorizontalTripplet,
  VerticalTripplet,
  VerticalArrangement,
  HorizontalArrangement,
  SingleImageLayout,
} from "UserInterface/Layouts";
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
          <HorizontalTripplet
            key={selectedPage}
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "vertical-triplet":
        return (
          <VerticalTripplet
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "vertical-arrangement":
        return (
          <VerticalArrangement
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "horizontal-arrangement":
        return (
          <HorizontalArrangement
            onImageDropped={handleDrop}
            onImageRemoved={handleRemove}
            initialImages={images}
          />
        );
      case "single-image":
        return (
          <SingleImageLayout
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
