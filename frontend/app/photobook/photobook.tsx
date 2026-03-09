import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { viewPhotobook } from "networking/NetworkService";
import { LayoutSelector, type LayoutType } from "./LayoutSelector";
import SideContent from "./SideContent";
import PhotobookPage from "./PhotobookPage";
import PhotobookControls from "./PhotobookControls";
import { PhotobookData, PageData } from "./types";
import "./photobook.css";

export default function Photobook() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PhotobookData | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageData, setPageData] = useState<{ [pageNumber: number]: PageData }>({});
  const [pageLayouts, setPageLayouts] = useState<{ [pageNumber: number]: LayoutType }>({});
  const [totalPages, setTotalPages] = useState(1);
  const [pageOrder, setPageOrder] = useState<number[]>([1]);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const photobookKey = searchParams.get("key") || "";

  // Initialize page data for all pages
  useEffect(() => {
    const initialPageData: { [pageNumber: number]: PageData } = {};
    const initialLayouts: { [pageNumber: number]: LayoutType } = {};
    for (let i = 1; i <= totalPages; i++) {
      if (!pageData[i]) {
        initialPageData[i] = new PageData(i);
      } else {
        initialPageData[i] = pageData[i];
      }
      initialLayouts[i] = pageData[i]?.layout || pageLayouts[i] || 'horizontal-triplet';
    }
    setPageData(initialPageData);
    setPageLayouts(initialLayouts);

    // Initialize pageOrder if it doesn't match totalPages
    if (pageOrder.length !== totalPages) {
      const newOrder = Array.from({ length: totalPages }, (_, i) => i + 1);
      setPageOrder(newOrder);
    }
  }, [totalPages]);

  const handleAddPage = (layout: LayoutType) => {
    const newPageNumber = totalPages + 1;
    setTotalPages(newPageNumber);
    setPageData((prev) => ({
      ...prev,
      [newPageNumber]: new PageData(newPageNumber, {}, layout),
    }));
    setPageLayouts((prev) => ({
      ...prev,
      [newPageNumber]: layout,
    }));
    setPageOrder((prev) => [...prev, newPageNumber]);
    setSelectedPage(newPageNumber);
  };

  const handleReorderPages = (oldIndex: number, newIndex: number) => {
    setPageOrder((prev) => arrayMove(prev, oldIndex, newIndex));
  };

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
          // Optionally populate layouts from response.pages if available
          if (response.pages) {
            const layouts: { [pageNumber: number]: LayoutType } = {};
            response.pages.forEach((p: { pageNumber: number; layout?: string }) => {
              if (p?.layout) layouts[p.pageNumber] = p.layout as LayoutType;
            });
            setPageLayouts((prev) => ({ ...prev, ...layouts }));
          }
        })
        .catch((error) => {
          console.error("Error fetching photobook:", error);
        });
    } else {
      setData(null);
    }
  }, [photobookKey]);

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
          onImageUpdated={(dropZoneIndex, dataUrl) => {
            setPageData((prev) => ({
              ...prev,
              [selectedPage]: {
                ...prev[selectedPage],
                images: {
                  ...prev[selectedPage]?.images,
                  [dropZoneIndex]: dataUrl,
                },
              },
            }));
          }}
          onImageRemovedLocal={(dropZoneIndex) => {
            setPageData((prev) => {
              const current = prev[selectedPage];
              if (!current) return prev;
              const newImages = { ...current.images };
              delete newImages[dropZoneIndex];
              return { ...prev, [selectedPage]: { ...current, images: newImages } as PageData };
            });
          }}
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