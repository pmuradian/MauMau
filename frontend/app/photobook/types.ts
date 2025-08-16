import { type LayoutType } from "UserInterface/LayoutSelector";

export class PageData {
    constructor(
        public pageNumber: number,
        public images: { [dropZoneIndex: number]: string } = {},
        public layout: LayoutType = 'horizontal-triplet'
    ) { }
}

export class PhotobookData {
    constructor(
        public title: string = "",
        public description: string = "",
        public images: string[] = [],
        public pages: PageData[] = []
    ) { }
}
