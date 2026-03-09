import { useState, useEffect, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { type LayoutType } from "./LayoutSelector";
import { PageData } from "./types";

interface PageState {
  selectedPage: number;
  setSelectedPage: (page: number) => void;
  pageData: { [pageNumber: number]: PageData };
  pageLayouts: { [pageNumber: number]: LayoutType };
  pageOrder: number[];
  totalPages: number;
  showLayoutSelector: boolean;
  setShowLayoutSelector: (show: boolean) => void;
  handleAddPage: (layout: LayoutType) => void;
  handleReorderPages: (oldIndex: number, newIndex: number) => void;
  onImageUpdated: (dropZoneIndex: number, url: string) => void;
  onImageRemovedLocal: (dropZoneIndex: number) => void;
  initializeFromResponse: (pages: Array<{ pageNumber: number; layout?: string; images?: Array<{ dropZoneIndex: number; imageUrl: string }> }>) => void;
}

export function usePageState(): PageState {
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageData, setPageData] = useState<{ [pageNumber: number]: PageData }>({});
  const [pageLayouts, setPageLayouts] = useState<{ [pageNumber: number]: LayoutType }>({});
  const [totalPages, setTotalPages] = useState(1);
  const [pageOrder, setPageOrder] = useState<number[]>([1]);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);

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

    if (pageOrder.length !== totalPages) {
      const newOrder = Array.from({ length: totalPages }, (_, i) => i + 1);
      setPageOrder(newOrder);
    }
  }, [totalPages]);

  const handleAddPage = useCallback((layout: LayoutType) => {
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
  }, [totalPages]);

  const handleReorderPages = useCallback((oldIndex: number, newIndex: number) => {
    setPageOrder((prev) => arrayMove(prev, oldIndex, newIndex));
  }, []);

  const onImageUpdated = useCallback((dropZoneIndex: number, url: string) => {
    setPageData((prev) => ({
      ...prev,
      [selectedPage]: {
        ...prev[selectedPage],
        images: {
          ...prev[selectedPage]?.images,
          [dropZoneIndex]: url,
        },
      },
    }));
  }, [selectedPage]);

  const onImageRemovedLocal = useCallback((dropZoneIndex: number) => {
    setPageData((prev) => {
      const current = prev[selectedPage];
      if (!current) return prev;
      const newImages = { ...current.images };
      delete newImages[dropZoneIndex];
      return { ...prev, [selectedPage]: { ...current, images: newImages } as PageData };
    });
  }, [selectedPage]);

  const initializeFromResponse = useCallback((pages: Array<{ pageNumber: number; layout?: string; images?: Array<{ dropZoneIndex: number; imageUrl: string }> }>) => {
    if (!pages || pages.length === 0) return;

    const layouts: { [pageNumber: number]: LayoutType } = {};
    const data: { [pageNumber: number]: PageData } = {};

    pages.forEach((p) => {
      if (p?.layout) layouts[p.pageNumber] = p.layout as LayoutType;
      const images: { [dropZoneIndex: number]: string } = {};
      if (p?.images) {
        p.images.forEach((img) => {
          images[img.dropZoneIndex] = img.imageUrl;
        });
      }
      data[p.pageNumber] = new PageData(p.pageNumber, images, (p.layout as LayoutType) || 'horizontal-triplet');
    });

    setPageLayouts((prev) => ({ ...prev, ...layouts }));
    setPageData((prev) => ({ ...prev, ...data }));
    setTotalPages(pages.length);
    setPageOrder(pages.map((p) => p.pageNumber));
  }, []);

  return {
    selectedPage,
    setSelectedPage,
    pageData,
    pageLayouts,
    pageOrder,
    totalPages,
    showLayoutSelector,
    setShowLayoutSelector,
    handleAddPage,
    handleReorderPages,
    onImageUpdated,
    onImageRemovedLocal,
    initializeFromResponse,
  };
}
