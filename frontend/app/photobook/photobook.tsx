import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { viewPhotobook, updatePhotobookTitle } from "networking/NetworkService";
import { LayoutSelector, type LayoutType } from "UserInterface/LayoutSelector";
import SideContent from "./SideContent";
import PhotobookPage from "./PhotobookPage";
import PhotobookControls from "./PhotobookControls";
import { PhotobookData, PageData } from "./types";
import "./photobook.css";

export default function Photobook() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({} as PhotobookData);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageData, setPageData] = useState<{ [pageNumber: number]: PageData }>({});
  const [pageLayouts, setPageLayouts] = useState<{ [pageNumber: number]: LayoutType }>({});
  const [totalPages, setTotalPages] = useState(1);
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
    setSelectedPage(newPageNumber);
  };

  useEffect(() => {
    if (photobookKey) {
      viewPhotobook(photobookKey)
        .then((response) => {
          console.log("Photobook details:", response);
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
            response.pages.forEach((p: any) => {
              if (p?.layout) layouts[p.pageNumber] = p.layout as LayoutType;
            });
            setPageLayouts((prev) => ({ ...prev, ...layouts }));
          }
        })
        .catch((error) => {
          console.error("Error fetching photobook:", error);
        });
    } else {
      console.log("No photobook key found.");
      setData({} as PhotobookData);
    }
  }, [photobookKey]);

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== data.title) {
      try {
        await updatePhotobookTitle(photobookKey, editedTitle.trim());
        setData((prev) => ({ ...prev, title: editedTitle.trim() }));
        console.log("Title updated successfully");
      } catch (error) {
        console.error("Error updating title:", error);
        alert("Failed to update title. Please try again.");
      }
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="photobook-container">
      <SideContent
        selectedPage={selectedPage}
        totalPages={totalPages}
        onPageSelect={setSelectedPage}
        onAddPage={() => setShowLayoutSelector(true)}
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
              const newPageData = { ...prev } as any;
              if (newPageData[selectedPage]) {
                const newImages = { ...newPageData[selectedPage].images };
                delete newImages[dropZoneIndex];
                newPageData[selectedPage] = {
                  ...newPageData[selectedPage],
                  images: newImages,
                };
              }
              return newPageData;
            });
          }}
        />

        <PhotobookControls title={data.title} photobookKey={photobookKey} />
      </div>

      <LayoutSelector
        isOpen={showLayoutSelector}
        onClose={() => setShowLayoutSelector(false)}
        onSelectLayout={handleAddPage}
      />
    </div>
  );
}