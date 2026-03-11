import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { viewPhotobook } from "networking/NetworkService";
import { LayoutSelector } from "./LayoutSelector";
import SideContent from "./SideContent";
import PhotobookPage from "./PhotobookPage";
import PhotobookControls from "./PhotobookControls";
import { PhotobookData } from "./types";
import { usePageState } from "./usePageState";
import { useToast } from "../contexts/ToastContext";
import "./photobook.css";

export default function Photobook() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PhotobookData | null>(null);
  const { showError } = useToast();
  const photobookKey = searchParams.get("key") || "";

  const {
    selectedPage,
    setSelectedPage,
    pageData,
    pageLayouts,
    pageOrder,
    showLayoutSelector,
    setShowLayoutSelector,
    handleAddPage,
    handleReorderPages,
    onImageUpdated,
    onImageRemovedLocal,
    initializeFromResponse,
  } = usePageState();

  useEffect(() => {
    if (photobookKey) {
      viewPhotobook(photobookKey)
        .then((response) => {
          setData(
            new PhotobookData(
              response.title || "Untitled Photobook",
              response.description || "No description available",
              response.images || [],
              response.pages || []
            )
          );
          if (response.pages) {
            initializeFromResponse(response.pages);
          }
        })
        .catch((error) => {
          console.error("Error fetching photobook:", error);
          showError("Failed to load photobook. Please refresh the page.");
        });
    } else {
      setData(null);
    }
  }, [photobookKey, initializeFromResponse, showError]);

  return (
    <div className="photobook-container">
      <SideContent
        selectedPage={selectedPage}
        pageOrder={pageOrder}
        onPageSelect={setSelectedPage}
        onAddPage={() => setShowLayoutSelector(true)}
        onReorderPages={handleReorderPages}
        pageLayouts={pageLayouts}
        pageImages={Object.fromEntries(
          Object.entries(pageData).map(([k, v]) => [k, v?.images || {}])
        )}
      />

      <div className="photobook-main-content">
        <PhotobookPage
          photobookKey={photobookKey}
          selectedPage={selectedPage}
          images={pageData[selectedPage]?.images || {}}
          layout={pageLayouts[selectedPage] || 'horizontal-triplet'}
          onImageUpdated={onImageUpdated}
          onImageRemovedLocal={onImageRemovedLocal}
          onImageRestored={onImageUpdated}
        />

        <PhotobookControls title={data?.title ?? ''} photobookKey={photobookKey} />
      </div>

      <LayoutSelector
        isOpen={showLayoutSelector}
        onClose={() => setShowLayoutSelector(false)}
        onSelectLayout={handleAddPage}
      />
    </div>
  );
}
